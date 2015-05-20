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
        this.elapsed = 30;
        this.curAnimFrameIdx = 0;
        this.curAnimTime = 0;
        this.totalAnimTime = totalTime * 1000;
    };

    KeyFrameAnim.prototype.activeAnim = function() {
        this.animTimer = Timer.setInterval(function(){this.updateAnim();}.bind(this), this.elapsed);
        this.readyAnim();
    };

    KeyFrameAnim.prototype.readyAnim = function() {
        this.curAnimTime = 0;
        this.curAnimFrameIdx = 0;
        this.x_path = new MotionPath();
        this.y_path = new MotionPath();
        this.readyDisplacement();
    };

    KeyFrameAnim.prototype.readyDisplacement = function() {
        var points = [];
        var ctrl_ptsA = [];
        var ctrl_ptsB = [];
        var node_count = this.keyFrames.length;

        var startFrameDesc = this.keyFrames[0];

        var posStartX = startFrameDesc.positionX;
        var posStartY = startFrameDesc.positionY;
        points.push({
            x: posStartX,
            y: posStartY
        })

        var ctrl_ptA = {
            x: posStartX + startFrameDesc.controlAX,
            y: posStartY + startFrameDesc.controlAY
        };

        for(var index = 1;  index < node_count; index ++) {
            ctrl_ptsA.push(ctrl_ptA);

            var keyframeDesc = this.keyFrames[index];

            var posX = keyframeDesc.positionX;
            var posY = keyframeDesc.positionY;
            points.push({
                x: posX,
                y: posY
            })

            var ctrl_ptB = {
                x: posX + keyframeDesc.controlBX,
                y: posY + keyframeDesc.controlBY
            };

            ctrl_ptsB.push(ctrl_ptB);

            ctrl_ptA = {
                x: posX + keyframeDesc.controlAX,
                y: posY + keyframeDesc.controlAY
            };

        }

        //create two motion paths, one for each dimension. see motionpath.js for properties
        this.x_path.start = points[0].x;
        this.y_path.start = points[0].y;
        for(var pointIdx = 0; pointIdx < node_count - 1; pointIdx ++) {
            this.x_path.bezierCurveTo(ctrl_ptsA[pointIdx].x, ctrl_ptsB[pointIdx].x, points[pointIdx + 1].x);
            this.y_path.bezierCurveTo(ctrl_ptsA[pointIdx].y, ctrl_ptsB[pointIdx].y, points[pointIdx + 1].y);
        }

        this.actor.createDisplacementModifier();
    };

    KeyFrameAnim.prototype.goNextKeyFrame = function() {

    };

    KeyFrameAnim.prototype.stopAnim = function() {
        if(this.animTimer) {
            Timer.clear(this.animTimer);
            delete this.animTimer;
        }
    };

    KeyFrameAnim.prototype.updateAnim = function() {
        this.curAnimTime += this.elapsed;

        if(this.curAnimTime > this.totalAnimTime) {
            this.curAnimTime = this.totalAnimTime;
        }

        var time = this.curAnimTime / this.totalAnimTime;
        //calculate position on entire path (0.0 - 1.0)
        var pos_x = this.x_path.interpolate(time);
        var pos_y = this.y_path.interpolate(time);
        this.actor.setDisplacementPos(pos_x, pos_y);

        console.log(this.actor.name + ' pos(' + pos_x + ','+ pos_y + ')');
        if(this.curAnimTime >= this.totalAnimTime) {
            this.curAnimTime = 0;
        }
    };

    KeyFrameAnim.prototype.setKeyFrameCallback = function(callback) {

    };

    module.exports = KeyFrameAnim;
});