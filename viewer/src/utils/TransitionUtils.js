define(function (require, exports, module) {
    'use strict';

    var Transform = require('famous/core/Transform');
    var Easing = require('famous/transitions/Easing');
    var TweenTransition = require('famous/transitions/TweenTransition');

    var TransitionUtils = {};

    // dir = [-1|0|1, -1|0|1]
    // 部分效果(例如3D翻转X)需要有方向性, 默认为 [1, 1]
    TransitionUtils.synthesizeLightBoxOptions = function(transition, page_size, dir) {
        var options = {
            inTransition: {duration: 500, curve: Easing.outQuad},
            outTransition: {duration: 500, curve: Easing.outQuad},
        }
        // 无 - MetStateNodeContentSlidingStyleNone
        if(transition === 0){
            options.inTransition = {duration: 0};
            options.outTransition = {duration: 0};
        }
        // 渐变 - MetStateNodeContentSlidingStyleFade
        else if(transition === 1) {
            options.inOpacity = 1;
            options.outOpacity = 0;
            options.together = true;
        }
        // 纵向吸附 - MetStateNodeContentSlidingStyleStickVertSlide
        else if(transition === 2) {
            options.inTransform = Transform.translate(0, page_size[1] * dir[1], 0);
            options.outTransform = Transform.translate(0, -page_size[1] * dir[1], 0);
            options.together = true;
        }
        // 横向吸附 - MetStateNodeContentSlidingStyleStickHorizSlide
        else if(transition === 3) {
            options.inTransform = Transform.translate(page_size[0] * dir[0], 0, 0);
            options.outTransform = Transform.translate(-page_size[0] * dir[0], 0, 0);
            options.together = true;
        }
        // 3D翻转X - MetStateNodeContentSlidingStyleRotationX
        else if(transition === 4) {
            options.inTransform = Transform.rotateX(-Math.PI * dir[1]/2);
            options.outTransform = Transform.rotateX(Math.PI * dir[1]/2);
        }
        // 3D翻转Y - MetStateNodeContentSlidingStyleRotationY
        else if(transition === 5){
            options.inTransform = Transform.rotateY(-Math.PI * dir[0]/2);
            options.outTransform = Transform.rotateY(Math.PI * dir[0]/2);
        }
        // 缩放 - MetStateNodeContentSlidingStyleZoom
        else if(transition === 6) {
            options.inTransform = Transform.scale(0.001, 0.001, 1);
            options.outTransform = Transform.scale(0.001, 0.001, 1);
        }
        // 弹出 - MetStateNodeContentSlidingStyleBounce
        else if(transition === 7) {
            options.inTransform = Transform.scale(0.001, 0.001, 1);
            options.outTransform = Transform.scale(0.001, 0.001, 1);
            options.inTransition = {duration: 500, curve: Easing.outBack};
            options.outTransition = {duration: 500, curve: Easing.inBack};
        }
        // 飞驰 - MetStateNodeContentSlidingStyleFly
        else if(transition === 8) {
            options.inTransform = Transform.identity;
            options.outTransform = Transform.translate(page_size[0] * dir[0], page_size[1] * dir[1], 0);
            options.together = true;
        }
        // 交换 - MetStateNodeContentSlidingStyleSwitch
        else if(transition === 9) {
            options.inTransform = Transform.translate(page_size[0] * dir[0], page_size[1] * dir[1], 0);
            options.outTransform = Transform.translate(page_size[0] * dir[0], page_size[1] * dir[1], 0);
            options.together = true;
        }
        // 覆盖 - MetStateNodeContentSlidingStyleSync
        else if(transition === 10) {
            options.inTransform = Transform.translate(-page_size[0] * dir[0], -page_size[1] * dir[1], 0);
            options.outTransform = Transform.identity;
            options.together = true;
        }

        return options;
    }

	TransitionUtils.synthesizeAnimateOptions = function(transition, t, off, page_size, dir) {
		var options = {
            opacity: 1,
            origin: [0.5, 0.5],
            align: [0.5, 0.5],
            transform: Transform.scale(1, 1, 1.00001),
            visible: true,
            zIndex: 1,
        };
		// 渐变 - MetStateNodeContentSlidingStyleFade
		if (transition === 1) {
            options.opacity = 1 - Math.abs(t + off);
            options.visible = true;
        }
		// 纵向吸附 - MetStateNodeContentSlidingStyleStickVertSlide
		else if (transition === 2) {
            options.transform = Transform.translate(0, (t + off) * page_size[1] * dir[1], 0);
            options.visible = true;
        }
		// 横向吸附 - MetStateNodeContentSlidingStyleStickHorizSlide
		else if (transition === 3) {
            options.transform = Transform.translate((t + off) * page_size[0] * dir[0], 0, 0);
            options.visible = true;
        }
		// 3D翻转X - MetStateNodeContentSlidingStyleRotationX
		else if (transition === 4) {
            options.transform = Transform.rotateX(-Math.PI * (t + off));
            if (off > 0)
                options.visible = t < -.5;
            else if (off < 0)
                options.visible = t > .5;
            else
                options.visible = t >= -.5 && t <= .5;
        }
		// 3D翻转Y - MetStateNodeContentSlidingStyleRotationY
		else if (transition === 5) {
            options.transform = Transform.rotateY(Math.PI * (t + off));
            if (off > 0)
                options.visible = t < -.5;
            else if (off < 0)
                options.visible = t > .5;
            else
                options.visible = t >= -.5 && t <= .5;
        }
		// 缩放 - MetStateNodeContentSlidingStyleZoom
		else if (transition === 6) {
            options.transform = Transform.scale(0.001 + (1 - Math.abs(t + off)) * 0.999, 0.001 + (1 - Math.abs(t + off)) * 0.999, 1);
            if (off > 0)
                options.visible = t < -.5;
            else if (off < 0)
                options.visible = t > .5;
            else
                options.visible = t >= -.5 && t <= .5;
        }
		// 弹出 - MetStateNodeContentSlidingStyleBounce
		else if (transition === 7) {
            options.transform = Transform.scale(0.001 + (1 - Math.abs(t + off)) * 0.999, 0.001 + (1 - Math.abs(t + off)) * 0.999, 1);
            if (off > 0)
                options.visible = t < -.5;
            else if (off < 0)
                options.visible = t > .5;
            else
                options.visible = t >= -.5 && t <= .5;
        }
		// 飞驰 - MetStateNodeContentSlidingStyleFly
        else if (transition === 8) {
            if(t < 0 || (t == 0 && off > 0)) {
                if (off > 0) {
                    options.transform = Transform.scale(0.8 + (1 - Math.abs(t + off)) * 0.2, 0.8 + (1 - Math.abs(t + off)) * 0.2, 1);
                    options.zIndex = 0;
                }
                else if (off < 0)
                    options.visible = false;
                else
                    options.transform = Transform.translate((t + off) * page_size[0] * dir[0], (t + off) * page_size[1] * dir[1], 0);
            }
            else{
                if (off > 0)
                    options.visible = false;
                else if (off < 0)
                    options.transform = Transform.translate((t + off) * page_size[0] * dir[0], (t + off) * page_size[1] * dir[1], 0);
                else {
                    options.transform = Transform.scale(0.8 + (1 - Math.abs(t + off)) * 0.2, 0.8 + (1 - Math.abs(t + off)) * 0.2, 1);
                    options.zIndex = 0;
                }
            }
        }
        // 交换 - MetStateNodeContentSlidingStyleSwitch
        else if (transition === 9) {
            options.transform = Transform.translate((t + off) * page_size[0] * dir[0], (t + off) * page_size[1] * dir[1], 0);
            if(t < 0 || (t == 0 && off > 0)) {
                if (off > 0)
                    options.transform = Transform.translate((t + off) * page_size[0] * dir[0], (t + off) * page_size[1] * dir[1], 0);
                else if (off < 0)
                    options.visible = false;
                else {
                    options.transform = Transform.translate(-(t + off) * page_size[0] * dir[0], -(t + off) * page_size[1] * dir[1], 0);
                    options.zIndex = 0;
                }
            }
            else{
                if (off > 0)
                    options.visible = false;
                else if (off < 0)
                    options.transform = Transform.translate(-(t + off) * page_size[0] * dir[0], -(t + off) * page_size[1] * dir[1], 0);
                else {
                    options.transform = Transform.translate((t + off) * page_size[0] * dir[0], (t + off) * page_size[1] * dir[1], 0);
                    options.zIndex = 0;
                }
            }
        }
        // 覆盖 - MetStateNodeContentSlidingStyleSync
		else if (transition === 10) {
            if (t < 0 || (t == 0 && off > 0)) {
                if (off > 0)
                    options.transform = Transform.translate((t + off) * page_size[0] * dir[0], (t + off) * page_size[1] * dir[1], 0);
                else if (off < 0)
                    options.visible = false;
                else {
                    options.transform = Transform.scale(0.8 + (1 - Math.abs(t + off)) * 0.2, 0.8 + (1 - Math.abs(t + off)) * 0.2, 1);
                    options.zIndex = 0;
                }
            }
            else {
                if (off > 0)
                    options.visible = false;
                else if (off < 0) {
                    options.transform = Transform.scale(0.8 + (1 - Math.abs(t + off)) * 0.2, 0.8 + (1 - Math.abs(t + off)) * 0.2, 1);
                    options.zIndex = 0;
                }
                else
                    options.transform = Transform.translate((t + off) * page_size[0] * dir[0], (t + off) * page_size[1] * dir[1], 0);
            }
        }
		return options;
	}

	module.exports = TransitionUtils;
});