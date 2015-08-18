/**
 * Created by sodemon on 2015/5/20.
 */
define(function (require, exports, module) {
    'use strict';

    var MetTimer               = require("utils/MetTimer");

    var MotionPath = require('utils/MotionPath');
    var EasingUtils = require('utils/EasingUtils');

    var MetNodeAction = null;
    require(['actions/MetNodeAction'], function (data) {
        MetNodeAction = data;
    });

    /** @constructor */
    function KeyFrameAnim(actor){
        this.actor = actor;
        this.keyFrames = actor.nodeDesc.keyframes;
        this.keyFramesCount = this.keyFrames.length;
        this.curAnimFrameIdx = 0;
        this.curAnimTime = 0;
        this.nextFrameTime = 0;
        this.totalAnimTime = actor.nodeDesc.duration * 1000;
        this.loopCount = 0;
        this.isPause = false;
		this.intervaTimer = 0;
		this.isReversePlay = false;

        this.initOffsetX = 0;
        this.initOffsetY = 0;
        this.x_path = null;
        this.y_path = null;
        this.curveArgs = null;
        this.initTangent = null;

        this.keyframeConfigs = MetNodeAction.parseKeyframesFromArray(actor.nodeDesc.keyframes);
    };

	KeyFrameAnim.ANIMFPS = 25; //framerate per frame
	KeyFrameAnim.MPFTIME = Math.floor(1000/KeyFrameAnim.ANIMFPS); //// Milliseconds per frame (1000/FPS)

    KeyFrameAnim.prototype.activeAnim = function() {
        this.stopAnim();
        this.readyAnim();
        this.animTimer = MetTimer.setInterval(function(elapse){this.updateAnim(elapse);}.bind(this), KeyFrameAnim.MPFTIME);
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
            MetTimer.clear(this.animTimer);
            delete this.animTimer;
        }
    };

    KeyFrameAnim.prototype.pauseAnim = function() {
        this.isPause = true;
        if(this.animTimer) {
			MetTimer.clear(this.animTimer);
            delete this.animTimer;
        }
    };

    KeyFrameAnim.prototype.resumeAnim = function() {
        this.isPause = false;
        this.animTimer = MetTimer.setInterval(function(elapse){this.updateAnim(elapse);}.bind(this), KeyFrameAnim.MPFTIME);
    };

    KeyFrameAnim.prototype.isPaused = function() {
        return this.isPause;
    };

    KeyFrameAnim.prototype.readyDisplacement = function() {
        var curFrameDesc = this.keyFrames[this.curAnimFrameIdx];
        var nextFrameDesc = this.keyFrames[this.curAnimFrameIdx + 1];

        var posStartX = curFrameDesc.positionX;
        var posStartY = curFrameDesc.positionY;

        if (this.curAnimFrameIdx === 0) {
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

        this.curveArgs = [posStartX, posStartY, ctrl_ptA.x, ctrl_ptA.y, ctrl_ptB.x, ctrl_ptB.y, posNextX, posNextY];
        // 如果设置了随动转向则记录初始角度, 今儿后续逻辑会进行随动
        if (this.actor.nodeDesc.autoRotate) {
            if (null == this.initTangent) {
                this.initTangent = __tangentAt.call(this, 0);
            }
        }
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
        var changed = this.curAnimFrameIdx != f;

        this.curAnimFrameIdx = f;
        this.curFrameTime = Math.floor(this.keyFrames[this.curAnimFrameIdx].time * 1000);
        this.curveFn = EasingUtils.easingFuncBy(this.keyFrames[this.curAnimFrameIdx].easing);

        if (this.curAnimFrameIdx < (this.keyFramesCount - 1)) {
            this.nextFrameTime = Math.floor(this.keyFrames[this.curAnimFrameIdx + 1].time * 1000);
			//now according to data, easing be in next fame info, may it'll be adjusted later
			this.curveFn = EasingUtils.easingFuncBy(this.keyFrames[this.curAnimFrameIdx + 1].easing);
        }
        else {
            this.nextFrameTime = Math.floor(this.keyFrames[this.keyFramesCount - 1].time * 1000);
        }
        if (this.curAnimFrameIdx < this.keyFramesCount - 1) {
            this.readyDisplacement();
            this.readyScale();
            this.readyRotation();
            this.readyOpacity();
        }

        // execute keyframe performs
        if(changed) {
            var cfg = this.keyframeConfigs[this.curAnimFrameIdx];
            for (var i = 0; i < cfg.performs.length; i++) {
                var pf = cfg.performs[i];
                pf.execute();
            }
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
        var deltaRotZ = 0;
        if(null != this.initTangent) {
            deltaRotZ = __tangentAt.call(this, process) - this.initTangent;
        }
        if(changeRotZ || deltaRotZ) {
            this.actor.setMetNodeRotateZ(this.startRotationZ + (changeRotZ * process) + deltaRotZ);
        }

        //calculate current opacity
        var changeOpacity = this.destOpacity - this.startOpacity;
        if(changeOpacity !== 0) {
            this.actor.setMetNodeOpacity(this.startOpacity + (changeOpacity * process));
        }

        // execute keyframe hooking!
        var cfg = this.keyframeConfigs[this.curAnimFrameIdx];
        for (var i = 0; i < cfg.hooks.length; i++) {
            var hk = cfg.hooks[i];
            hk.executeStep(process);
        }
    }

    function __tangentAt(parameter){
        if(null == this.curveArgs) return 0;
        // start, ctrlA, ctrlB, end
        var point_xs = [this.curveArgs[0], this.curveArgs[2], this.curveArgs[4], this.curveArgs[6]];
        var point_ys = [this.curveArgs[1], this.curveArgs[3], this.curveArgs[5], this.curveArgs[7]];
        var left_xs = [point_xs[0], 0, 0, 0];
        var left_ys = [point_ys[0], 0, 0, 0];
        var right_xs = [0, 0, 0, point_xs[3]];
        var right_ys = [0, 0, 0, point_ys[3]];

        for(var k = 1; k <= 3; k++){
            for(var i = 0; i <= (3 - k); i++){
                point_xs[i] = (1.0 - parameter) * point_xs[i] + parameter * point_xs[i + 1];
                point_ys[i] = (1.0 - parameter) * point_ys[i] + parameter * point_ys[i + 1];
            }

            left_xs[k] = point_xs[0];
            left_ys[k] = point_ys[0];

            right_xs[3 - k] = point_xs[3 - k];
            right_ys[3 - k] = point_ys[3 - k];
        }
        var angle = Math.atan2(right_ys[1] - left_ys[2], right_xs[1] - left_xs[2]);
        return angle;
    }

    KeyFrameAnim.prototype.updateAnim = function(elapse) {
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
			this.curAnimTime -= elapse;

			var starttime = Math.floor(this.keyFrames[0].time * 1000);
			if(this.curAnimTime <= starttime) {
				this.curAnimTime = starttime;
				isAnimEnd = true;
			} else if(this.curAnimTime <= this.curFrameTime) {
				this.curAnimTime = this.curFrameTime;
				isFireNextFrame = true;
			}

		} else {
			this.curAnimTime += elapse;
			var endtime = Math.floor(this.keyFrames[this.keyFramesCount - 1].time * 1000);
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
					this.curAnimTime = Math.floor(this.keyFrames[this.keyFramesCount - 1].time * 1000);
					this.startAnim(this.keyFramesCount - 2);
				} else {
					this.curAnimTime = Math.floor(this.keyFrames[0].time * 1000);
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