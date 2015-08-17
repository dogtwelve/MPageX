/**
 * Created by sodemon on 2015/5/20.
 */
define(function (require, exports, module) {
    'use strict';

    var Timer               = require("famous/utilities/Timer");

    var MotionPath = require('utils/MotionPath');
    var EasingUtils = require('utils/EasingUtils');

    /** @constructor */
    function KeyFrameAnim(actor){
        this.actor = actor;
        this.keyFrames = actor.nodeDesc.keyframes;
        this.keyFramesCount = this.keyFrames.length;
        this.curAnimFrameIdx = 0;
        this.curAnimTime = 0;
        this.nextFrameTime = 0;
        this.totalAnimTime = actor.nodeDesc.duration * 1000;
        this.initOffsetX = 0;
        this.initOffsetY = 0;
        this.loopCount = 0;
        this.isPause = false;
		this.intervaTimer = 0;
		this.isReversePlay = false;
    };

	KeyFrameAnim.ANIMFPS = 35; //framerate per frame
	KeyFrameAnim.MPFTIME = Math.floor(1000/KeyFrameAnim.ANIMFPS); //// Milliseconds per frame (1000/FPS)

    KeyFrameAnim.prototype.activeAnim = function() {
        this.stopAnim();
        this.readyAnim();
        this.animTimer = Timer.setInterval(function(){this.updateAnim();}.bind(this), KeyFrameAnim.MPFTIME);
    };

    KeyFrameAnim.prototype.readyAnim = function() {
        this.actor.createDisplacementModifier();
		this.curAnimTime = 0;
        this.startAnim(0);
    };

    KeyFrameAnim.prototype.startAnim = function(startFrame) {
        this.gotoKeyFrame(startFrame);
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
        this.animTimer = Timer.setInterval(function(){this.updateAnim();}.bind(this), KeyFrameAnim.MPFTIME);
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

    KeyFrameAnim.prototype.gotoTime = function(t) {
        var kfs = this.keyFrames;
        var frame = -1;
        var s = 0;
        for (var i = 0; i < kfs.length - 1; i++) {
            var kf = kfs[i];
            var kfn = kfs[i + 1];
            if(i == 0){
                if(t < kf.time * 1000){
                    frame = i;
                    break;
                }
            }
            else if(i == kfs.length - 2){
                if(t >= kfn.time * 1000){
                    frame = i + 1;
                    break;
                }
            }

            if(t >= kf.time * 1000 && t < kfn.time * 1000){
                frame = i;
                break;
            }
        }
        if (-1 != frame) {
            this.gotoKeyFrame(frame);
            __updateAnimAt.call(this, this.curAnimTime = t);
        }
    };

    KeyFrameAnim.prototype.gotoKeyFrame = function(f) {
        //if (this.curAnimFrameIdx == f) return;

        this.curAnimFrameIdx = f;
        this.curFrameTime = this.keyFrames[this.curAnimFrameIdx].time * 1000;
        this.curveFn = EasingUtils.easingFuncBy(this.keyFrames[this.curAnimFrameIdx].easing);

        if (this.curAnimFrameIdx < (this.keyFramesCount - 1)) {
            this.nextFrameTime = this.keyFrames[this.curAnimFrameIdx + 1].time * 1000;
			//now according to data, easing be in next fame info, may it'll be adjusted later
			this.curveFn = EasingUtils.easingFuncBy(this.keyFrames[this.curAnimFrameIdx + 1].easing);
        }
        else {
            this.nextFrameTime = this.keyFrames[this.keyFramesCount - 1].time * 1000;
        }
        if (this.curAnimFrameIdx < this.keyFramesCount - 1) {
            this.readyDisplacement();
            this.readyScale();
            this.readyRotation();
            this.readyOpacity();
        }
    };

    function __updateAnimAt(t){
		if(t < this.curFrameTime || t > this.nextFrameTime) {
			return;
		}
        var process = this.curveFn((t - this.curFrameTime) / (this.nextFrameTime - this.curFrameTime));

        //calculate position on entire path (0.0 - 1.0)
        var pos_x = this.x_path.interpolate(process);
        var pos_y = this.y_path.interpolate(process);
        this.actor.setDisplacementPos(pos_x - this.initOffsetX, pos_y - this.initOffsetY);

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
    };

    KeyFrameAnim.prototype.updateAnim = function() {
        if(this.isPause) {
            return;
        }

		if(this.intervaTimer > 0) {
			this.intervaTimer -= KeyFrameAnim.MPFTIME;
			if(this.intervaTimer <= 0) {
				this.intervaTimer = 0;
			} else {
				return;
			}
		}

		var isFireNextFrame = false;
		var isAnimEnd = false;

		if(this.isReversePlay) {
			this.curAnimTime -= KeyFrameAnim.MPFTIME;

			var starttime = this.keyFrames[0].time * 1000;
			if(this.curAnimTime <= starttime) {
				this.curAnimTime = starttime;
				isAnimEnd = true;
			} else if(this.curAnimTime <= this.curFrameTime) {
				this.curAnimTime = this.curFrameTime;
				isFireNextFrame = true;
			}

		} else {
			this.curAnimTime += KeyFrameAnim.MPFTIME;
			var endtime = this.keyFrames[this.keyFramesCount - 1].time * 1000;
			if(this.curAnimTime >= endtime) {
				this.curAnimTime = endtime;
				isAnimEnd = true;
			} else if(this.curAnimTime >= this.nextFrameTime) {
				this.curAnimTime = this.nextFrameTime;
				isFireNextFrame = true;
			}
		}



        //if(this.curAnimTime > this.totalAnimTime) {
        //    this.curAnimTime = this.totalAnimTime;
        //} else if(this.curAnimTime >= this.nextFrameTime) {
        //    this.curAnimTime = this.nextFrameTime;
        //    isFireNextFrame = true;
        //}

        __updateAnimAt.call(this, this.curAnimTime);

        if(isFireNextFrame) {
			if(this.isReversePlay) {
				this.gotoKeyFrame(this.curAnimFrameIdx - 1);
			} else {
				this.gotoKeyFrame(this.curAnimFrameIdx + 1);
			}

        }

        if(isAnimEnd) {

			this.loopCount ++;
            if(this.actor.nodeDesc.endlessLoop > 0 || this.loopCount < this.actor.nodeDesc.repeatCount){

				this.intervaTimer = this.actor.nodeDesc.interval * 1000;

				//toggle the reverse flag if necessary
				if(this.actor.nodeDesc.autoreverses) {
					this.isReversePlay = !this.isReversePlay;
				}

				if(this.isReversePlay) {
					this.curAnimTime = this.keyFrames[this.keyFramesCount - 1].time * 1000;
					this.startAnim(this.keyFramesCount - 2);
				} else {
					this.curAnimTime = this.keyFrames[0].time * 1000;
					this.startAnim(0);
				}
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