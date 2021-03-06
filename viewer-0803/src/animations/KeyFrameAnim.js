/**
 * Created by sodemon on 2015/5/20.
 */
define(function (require, exports, module) {
    'use strict';

    var Timer               = require("famous/utilities/Timer");

    var MotionPath = require('utils/MotionPath');
    var EasingUtils = require('utils/EasingUtils');

    /** @constructor */
    function KeyFrameAnim(actor, totalTime, keyFrames, loop){
        this.actor = actor;
        this.keyFrames = keyFrames;
        this.keyFramesCount = keyFrames.length;
        this.elapsed = 35;
        this.curAnimFrameIdx = 0;
        this.curAnimTime = 0;
        this.nextFrameTime = 0;
        this.totalAnimTime = totalTime * 1000;
        this.initOffsetX = 0;
        this.initOffsetY = 0;
        this.loop = loop;
        this.isPause = false;
    };

    KeyFrameAnim.prototype.activeAnim = function() {
		if(this.keyFramesCount <= 1) {
			//null anim
			return;
		}
        this.stopAnim();
        this.readyAnim();
        this.animTimer = Timer.setInterval(function(){this.updateAnim();}.bind(this), this.elapsed);
    };

    KeyFrameAnim.prototype.readyAnim = function() {
        this.actor.createDisplacementModifier();
        this.resetAnim();
    };

    KeyFrameAnim.prototype.resetAnim = function() {
        this.curAnimTime = 0;
        this.curAnimFrameIdx = -1;
        this.goNextKeyFrame();
    };


    KeyFrameAnim.prototype.stopAnim = function() {
        this.actor.resetMetNodePosAdjustZ();
        if(this.animTimer) {
            Timer.clear(this.animTimer);
            delete this.animTimer;
        }
    };

    KeyFrameAnim.prototype.pauseAnim = function() {
        this.isPause = true;
        if(this.animTimer) {
            Timer.clear(this.animTimer);
            delete this.animTimer;
        }
    };

    KeyFrameAnim.prototype.resumeAnim = function() {
        this.isPause = false;
        this.animTimer = Timer.setInterval(function(){this.updateAnim();}.bind(this), this.elapsed);
    };

    KeyFrameAnim.prototype.isPaused = function() {
        return this.isPause;
    };

    KeyFrameAnim.prototype.readyDisplacement = function() {
        var curFrameDesc = this.keyFrames[this.curAnimFrameIdx];
        var nextFrameDesc = this.keyFrames[this.curAnimFrameIdx + 1];

        var posStartX = curFrameDesc.positionX;
        var posStartY = curFrameDesc.positionY;

        if(this.curAnimFrameIdx === 0) {
            this.initOffsetX = posStartX;
            this.initOffsetY = posStartY;
        }

        var posNextX = nextFrameDesc.positionX;
        var posNextY = nextFrameDesc.positionY;

        var ctrl_ptA = {
            x: posStartX + curFrameDesc.controlAX,
            y: posStartY + curFrameDesc.controlAY
        };

        var ctrl_ptB = {
            x: posNextX + nextFrameDesc.controlBX,
            y: posNextY + nextFrameDesc.controlBY
        }

        //create two motion paths, one for each dimension. see motionpath.js for properties
        this.x_path = new MotionPath();
        this.y_path = new MotionPath();
        this.x_path.start = posStartX;
        this.y_path.start = posStartY;
        this.x_path.bezierCurveTo(ctrl_ptA.x, ctrl_ptB.x, posNextX);
        this.y_path.bezierCurveTo(ctrl_ptA.y, ctrl_ptB.y, posNextY);

    };

    KeyFrameAnim.prototype.readyScale = function() {
        var curFrameDesc = this.keyFrames[this.curAnimFrameIdx];
        var destFrameDesc = this.keyFrames[this.curAnimFrameIdx + 1];
        this.startScaleX = curFrameDesc.scaleX;
        this.startScaleY = curFrameDesc.scaleY;
        this.destScaleX = destFrameDesc.scaleX;
        this.destScaleY = destFrameDesc.scaleY;
    }

    KeyFrameAnim.prototype.readyRotation = function() {
        var curFrameDesc = this.keyFrames[this.curAnimFrameIdx];
        var destFrameDesc = this.keyFrames[this.curAnimFrameIdx + 1];
        this.startRotationX = curFrameDesc.rotationX;
        this.startRotationY = curFrameDesc.rotationY;
        this.startRotationZ = curFrameDesc.rotation;
        this.destRotationX = destFrameDesc.rotationX;
        this.destRotationY = destFrameDesc.rotationY;
        this.destRotationZ = destFrameDesc.rotation;
    }

    KeyFrameAnim.prototype.readyOpacity = function() {
        var curFrameDesc = this.keyFrames[this.curAnimFrameIdx];
        var destFrameDesc = this.keyFrames[this.curAnimFrameIdx + 1];
        this.startOpacity = curFrameDesc.opacity;
        this.destOpacity = destFrameDesc.opacity;
    }

    KeyFrameAnim.prototype.goNextKeyFrame = function() {
        this.curAnimFrameIdx ++;
        this.curFrameTime = this.keyFrames[this.curAnimFrameIdx].time * 1000;
        //this.curveFn = EasingUtils.easingFuncBy(this.keyFrames[this.curAnimFrameIdx].easing);

        if(this.curAnimFrameIdx < (this.keyFramesCount - 1)) {
            this.nextFrameTime = this.keyFrames[this.curAnimFrameIdx + 1].time * 1000;
			this.curveFn = EasingUtils.easingFuncBy(this.keyFrames[this.curAnimFrameIdx + 1].easing);
        } else {
            this.nextFrameTime = this.totalAnimTime;
        }

        this.readyDisplacement();
        this.readyScale();
        this.readyRotation();
        this.readyOpacity();
    };

    KeyFrameAnim.prototype.updateAnim = function() {
        if(this.isPause) {
            return;
        }

        this.curAnimTime += this.elapsed;
        var isFireNextFrame = false;

        if(this.curAnimTime > this.totalAnimTime) {
            this.curAnimTime = this.totalAnimTime;
        } else if(this.curAnimTime >= this.nextFrameTime) {
            this.curAnimTime = this.nextFrameTime;
            isFireNextFrame = true;
        }


        //var time = (this.curAnimTime - this.curFrameTime) / (this.nextFrameTime - this.curFrameTime);

        //this.curveFn((scrollPosition - this.scrollStart) / this.scrollRange);
        //process in (0.0 - 1.0)
        var process = this.curveFn((this.curAnimTime - this.curFrameTime) / (this.nextFrameTime - this.curFrameTime));

        //calculate position on entire path (0.0 - 1.0)
        var pos_x = this.x_path.interpolate(process);
        var pos_y = this.y_path.interpolate(process);
        this.actor.setDisplacementPos(pos_x - this.initOffsetX, pos_y - this.initOffsetY);

        //console.log(this.actor.name + ' pos(' + pos_x + ','+ pos_y + ')');

        //calculate current scale
        var changeScaleX = this.destScaleX - this.startScaleX;
        if(changeScaleX !== 0) {
            this.actor.setMetNodeScaleX(this.startScaleX + (changeScaleX * process));
        }
        var changeScaleY = this.destScaleY - this.startScaleY;
        if(changeScaleY !== 0) {
            this.actor.setMetNodeScaleY(this.startScaleY + (changeScaleY * process));
        }

        //calculate current rotation
        var changeRotX = this.destRotationX - this.startRotationX;
        if(changeRotX) {
            this.actor.setMetNodeRotateX(this.startRotationX + (changeRotX * process));
        }
        var changeRotY = this.destRotationY - this.startRotationY;
        if(changeRotY) {
            this.actor.setMetNodeRotateY(this.startRotationY + (changeRotY * process));
        }
        var changeRotZ = this.destRotationZ - this.startRotationZ;
        if(changeRotZ) {
            this.actor.setMetNodeRotateZ(this.startRotationZ + (changeRotZ * process));
        }

        //calculate current opacity
        var changeOpacity = this.destOpacity - this.startOpacity;
        if(changeOpacity !== 0) {
            this.actor.setMetNodeOpacity(this.startOpacity + (changeOpacity * process));
        }

        if(isFireNextFrame) {
            this.goNextKeyFrame();
        }

        if(this.curAnimTime >= this.totalAnimTime) {

            if(this.loop){
                this.resetAnim();
            } else {
                this.stopAnim();
            }
            return;
        }
    };

    KeyFrameAnim.prototype.setKeyFrameCallback = function(callback) {

    };

    module.exports = KeyFrameAnim;
});