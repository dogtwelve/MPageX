/**
 * Created by sodemon on 2015/5/20.
 */
define(function (require, exports, module) {
    'use strict';

    var Easing              = require('famous/transitions/Easing');
    var TweenTransition     = require('famous/transitions/TweenTransition');
    var Timer               = require("famous/utilities/Timer");
    var MotionPath          = require('utils/MotionPath');

    /** @constructor */
    function KeyFrameAnim(actor, totalTime, keyFrames, loop){
        this.actor = actor;
        this.keyFrames = keyFrames;
        this.keyFramesCount = keyFrames.length;
        this.elapsed = 30;
        this.curAnimFrameIdx = 0;
        this.curAnimTime = 0;
        this.nextFrameTime = 0;
        this.totalAnimTime = totalTime * 1000;
        this.initOffsetX = 0;
        this.initOffsetY = 0;
        this.loop = loop;
    };

    KeyFrameAnim.prototype.activeAnim = function() {
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
        this.curveFn = _getEaseCurve(this.keyFrames[this.curAnimFrameIdx].easing);

        if(this.curAnimFrameIdx < (this.keyFramesCount - 2)) {
            this.nextFrameTime = this.keyFrames[this.curAnimFrameIdx + 1].time * 1000;
        } else {
            this.nextFrameTime = this.totalAnimTime;
        }

        this.readyDisplacement();
        this.readyScale();
        this.readyRotation();
        this.readyOpacity();
    };

    KeyFrameAnim.prototype.stopAnim = function() {
        this.actor.resetMetNodePosAdjustZ();
        if(this.animTimer) {
            Timer.clear(this.animTimer);
            delete this.animTimer;
        }
    };

    KeyFrameAnim.prototype.updateAnim = function() {
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


    //EaseType ENUM
    /*
        EaseInstant = 0,
        EaseLinear = 1,
        EaseInSine = 2,
        EaseOutSine = 3,
        EaseInOutSine = 4,
        EaseInQuad = 5,
        EaseOutQuad = 6,
        EaseInOutQuad = 7,
        EaseInCubic = 8,
        EaseOutCubic = 9,
        EaseInOutCubic = 10,
        EaseInQuart = 11,
        EaseOutQuart = 12,
        EaseInOutQuart = 13,
        EaseInQuint = 14,
        EaseOutQuint = 15,
        EaseInOutQuint = 16,
        EaseInExpo = 17,
        EaseOutExpo = 18,
        EaseInOutExpo = 19,
        EaseInCirc = 20,
        EaseOutCirc = 21,
        EaseInOutCirc = 22,
        EaseInBack = 23,
        EaseOutBack = 24,
        EaseInOutBack = 25,
        EaseInElastic = 26,
        EaseOutElastic = 27,
        EaseInOutElastic = 28,
        EaseInBounce = 29,
        EaseOutBounce = 30,
        EaseInOutBounce = 31,
    */

    function _getEaseCurve(easeType) {
        switch(easeType) {
            case 1:
            {
                //EaseLinear
                return  TweenTransition.Curves.linear;
            }
                break;
            case 2:
            {
                //EaseInSine
                return  Easing.inSine;
            }
                break;
            case 3:
            {
                //EaseOutSine
                return  Easing.outSine;
            }
                break;
            case 4:
            {
                //EaseInOutSine
                return  Easing.inOutSine;
            }
                break;
            case 5:
            {
                //EaseInQuad
                return  Easing.inQuad;
            }
                break;
            case 6:
            {
                //EaseOutQuad
                return  Easing.outQuad;
            }
                break;
            case 7:
            {
                //EaseInOutQuad
                return  Easing.inOutQuad;
            }
                break;
            case 8:
            {
                //EaseInCubic
                return  Easing.inCubic;
            }
                break;
            case 9:
            {
                //EaseOutCubic
                return  Easing.outCubic;
            }
                break;
            case 10:
            {
                //EaseInOutCubic
                return  Easing.inOutCubic;
            }
                break;
            case 11:
            {
                //EaseInQuart
                return  Easing.inQuart;
            }
                break;
            case 12:
            {
                //EaseOutQuart
                return  Easing.outQuart;
            }
                break;
            case 13:
            {
                //EaseInoutQuart
                return  Easing.inOutQuart;
            }
                break;
            case 14:
            {
                //EaseInQuint
                return  Easing.inQuint;
            }
                break;
            case 15:
            {
                //EaseOutQuint
                return  Easing.outQuint;
            }
                break;
            case 16:
            {
                //EaseUbOutQuint
                return  Easing.inOutQuint;
            }
                break;
            case 17:
            {
                //EaseInExpo
                return  Easing.inExpo;
            }
                break;
            case 18:
            {
                //EaseOutExpo
                return  Easing.outExpo;
            }
                break;
            case 19:
            {
                //EaseInOutExpo
                return  Easing.inOutExpo;
            }
                break;
            case 20:
            {
                //EaseInCirc
                return  Easing.inCirc;
            }
                break;
            case 21:
            {
                //EaseOutCirc
                return  Easing.outCirc;
            }
                break;
            case 22:
            {
                //EaseinOutCirc
                return  Easing.inOutCirc;
            }
                break;
            case 23:
            {
                //EaseInBack
                return  Easing.inBack;
            }
                break;
            case 24:
            {
                //EaseOutBack
                return  Easing.outBack;
            }
                break;
            case 25:
            {
                //EaseInOutBack
                return  Easing.inOutBack;
            }
                break;
            case 26:
            {
                //EaseInElastic
                return  Easing.inElastic;
            }
                break;
            case 27:
            {
                //EaseOutElastic
                return  Easing.outElastic;
            }
                break;
            case 28:
            {
                //EaseinOutElastic
                return  Easing.inOutElastic;
            }
                break;
            case 29:
            {
                //EaseInBounce
                return  Easing.inBounce;
            }
                break;
            case 30:
            {
                //EaseOutBounce
                return  Easing.outBounce;
            }
                break;
            case 31:
            {
                //EaseInOutBounce
                return  Easing.inOutBounce;
            }
                break;
            default :
                return  TweenTransition.Curves.linear;

        }
    }

    KeyFrameAnim.prototype.setKeyFrameCallback = function(callback) {

    };

    module.exports = KeyFrameAnim;
});