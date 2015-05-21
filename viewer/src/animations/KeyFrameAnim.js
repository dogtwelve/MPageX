/**
 * Created by sodemon on 2015/5/20.
 */
define(function (require, exports, module) {
    'use strict';

    var Timer       = require("famous/utilities/Timer");
    var MotionPath   = require('utils/MotionPath');

    /** @constructor */
    function KeyFrameAnim(actor, totalTime, keyFrames){
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
    };

    KeyFrameAnim.prototype.activeAnim = function() {
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
        var points = [];
        var ctrl_ptsA = [];
        var ctrl_ptsB = [];
        var node_count = this.keyFrames.length;

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

    KeyFrameAnim.prototype.goNextKeyFrame = function() {
        this.curAnimFrameIdx ++;
        this.curFrameTime = this.keyFrames[this.curAnimFrameIdx].time * 1000;

        if(this.curAnimFrameIdx < (this.keyFramesCount - 2)) {
            this.nextFrameTime = this.keyFrames[this.curAnimFrameIdx + 1].time * 1000;
        } else {
            this.nextFrameTime = this.totalAnimTime;
        }

        this.readyDisplacement();
    };

    KeyFrameAnim.prototype.stopAnim = function() {
        if(this.animTimer) {
            Timer.clear(this.animTimer);
            delete this.animTimer;
        }
    };

    KeyFrameAnim.prototype.updateAnim = function() {
        this.curAnimTime += this.elapsed;
        var isFireNextFrame = false;

        if(this.curAnimTime > this.totalAnimTime) {
            this.resetAnim();
            return;
        } else if(this.curAnimTime >= this.nextFrameTime) {
            this.curAnimTime = this.nextFrameTime;
            isFireNextFrame = true;
        }

        var time = (this.curAnimTime - this.curFrameTime) / (this.nextFrameTime - this.curFrameTime);
        //calculate position on entire path (0.0 - 1.0)
        var pos_x = this.x_path.interpolate(time);
        var pos_y = this.y_path.interpolate(time);
        this.actor.setDisplacementPos(pos_x - this.initOffsetX, pos_y - this.initOffsetX);

        //console.log(this.actor.name + ' pos(' + pos_x + ','+ pos_y + ')');

        if(isFireNextFrame) {
            this.goNextKeyFrame();
        }
    };

    KeyFrameAnim.prototype.setKeyFrameCallback = function(callback) {

    };

    module.exports = KeyFrameAnim;
});