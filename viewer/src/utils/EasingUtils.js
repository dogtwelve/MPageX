define(function (require, exports, module) {
    'use strict';

    var Easing = require('famous/transitions/Easing');
    var TweenTransition = require('famous/transitions/TweenTransition');

    var EasingUtils = {};

    // EaseType ENUM
    EasingUtils.EaseInstant = 0;
    EasingUtils.EaseLinear = 1;
    EasingUtils.EaseInSine = 2;
    EasingUtils.EaseOutSine = 3;
    EasingUtils.EaseInOutSine = 4;
    EasingUtils.EaseInQuad = 5;
    EasingUtils.EaseOutQuad = 6;
    EasingUtils.EaseInOutQuad = 7;
    EasingUtils.EaseInCubic = 8;
    EasingUtils.EaseOutCubic = 9;
    EasingUtils.EaseInOutCubic = 10;
    EasingUtils.EaseInQuart = 11;
    EasingUtils.EaseOutQuart = 12;
    EasingUtils.EaseInOutQuart = 13;
    EasingUtils.EaseInQuint = 14;
    EasingUtils.EaseOutQuint = 15;
    EasingUtils.EaseInOutQuint = 16;
    EasingUtils.EaseInExpo = 17;
    EasingUtils.EaseOutExpo = 18;
    EasingUtils.EaseInOutExpo = 19;
    EasingUtils.EaseInCirc = 20;
    EasingUtils.EaseOutCirc = 21;
    EasingUtils.EaseInOutCirc = 22;
    EasingUtils.EaseInBack = 23;
    EasingUtils.EaseOutBack = 24;
    EasingUtils.EaseInOutBack = 25;
    EasingUtils.EaseInElastic = 26;
    EasingUtils.EaseOutElastic = 27;
    EasingUtils.EaseInOutElastic = 28;
    EasingUtils.EaseInBounce = 29;
    EasingUtils.EaseOutBounce = 30;
    EasingUtils.EaseInOutBounce = 31;

    EasingUtils.easingFuncBy = function(easeType) {
        switch (easeType) {
            case EasingUtils.EaseLinear:
                return TweenTransition.Curves.linear;
            case EasingUtils.EaseInSine:
                return Easing.inSine;
            case EasingUtils.EaseOutSine:
                return Easing.outSine;
            case EasingUtils.EaseInOutSine:
                return Easing.inOutSine;
            case EasingUtils.EaseInQuad:
                return Easing.inQuad;
            case EasingUtils.EaseOutQuad:
                return Easing.outQuad;
            case EasingUtils.EaseInOutQuad:
                return Easing.inOutQuad;
            case EasingUtils.EaseInCubic:
                return Easing.inCubic;
            case EasingUtils.EaseOutCubic:
                return Easing.outCubic;
            case EasingUtils.EaseInOutCubic:
                return Easing.inOutCubic;
            case EasingUtils.EaseInQuart:
                return Easing.inQuart;
            case EasingUtils.EaseOutQuart:
                return Easing.outQuart;
            case EasingUtils.EaseInoutQuart:
                return Easing.inOutQuart;
            case EasingUtils.EaseInQuint:
                return Easing.inQuint;
            case EasingUtils.EaseOutQuint:
                return Easing.outQuint;
            case EasingUtils.EaseInOutQuint:
                return Easing.inOutQuint;
            case EasingUtils.EaseInExpo:
                return Easing.inExpo;
            case EasingUtils.EaseOutExpo:
                return Easing.outExpo;
            case EasingUtils.EaseInOutExpo:
                return Easing.inOutExpo;
            case EasingUtils.EaseInCirc:
                return Easing.inCirc;
            case EasingUtils.EaseOutCirc:
                return Easing.outCirc;
            case EasingUtils.EaseinOutCirc:
                return Easing.inOutCirc;
            case EasingUtils.EaseInBack:
                return Easing.inBack;
            case EasingUtils.EaseOutBack:
                return Easing.outBack;
            case EasingUtils.EaseInOutBack:
                return Easing.inOutBack;
            case EasingUtils.EaseInElastic:
                return Easing.inElastic;
            case EasingUtils.EaseOutElastic:
                return Easing.outElastic;
            case EasingUtils.EaseInOutElastic:
                return Easing.inOutElastic;
            case EasingUtils.EaseInBounce:
                return Easing.inBounce;
            case EasingUtils.EaseOutBounce:
                return Easing.outBounce;
            case EasingUtils.EaseInOutBounce:
                return Easing.inOutBounce;
            default:
        }
        return TweenTransition.Curves.linear;
    }

    module.exports = EasingUtils;
});