/**
 * Created by sodemon on 2015/5/20.
 */
define(function (require, exports, module) {
    'use strict';

    var Easing              = require('famous/transitions/Easing');
    var TweenTransition     = require('famous/transitions/TweenTransition');
    var Timer               = require("famous/utilities/Timer");

    var MetHook = require('actions/MetHook');
    var MetPerform = require('actions/MetPerform');

    /** @constructor */
    function MetNodeAction(){
        // # 操作ID - global unique
        this.id_ = "";
        // # 操作类型type
        this.actionType = 0;

        // [播放(autoplay)] : 状态持续时间
        // [缩放(zoom)] : 最小缩放系数
        // [拖拽(drag)] : fromX
        // [重力感应(gravity)] : fromX
        // [擦除(erase)] : 擦除半径
        this.f1 = 0;

        // [播放(autoplay)] : 播放间隔
        // [缩放(zoom)] : 最大缩放系数
        // [拖拽(drag)] : toX
        // [重力感应(gravity)] : toX
        // [猛滑(slide)] : toX
        // [擦除(erase)] : 完成判定比例
        this.f2 = 0;

        // [播放(autoplay)] : 播放延迟
        // [拖拽(drag)] : fromY
        // [重力感应(gravity)] : fromY
        this.f3 = 0;

        // [拖拽(drag)] : toY
        // [重力感应(gravity)] : toY
        // [猛滑(slide)] : toY
        this.f4 = 0;
        // [重力感应(gravity)] : 加速度
        this.f5 = 0;

        // [播放(autoplay)] : 循环次数
        // [拖拽(drag))] : 拖拽方向
        // [滚动(scroll)] : 滚动方向
        // [猛滑(slide)] : 猛划方向
        this.i1 = 0;

        // [播放(autoplay)] : 往复循环吗? 0表示false, 非0表示true
        // [猛滑(slide)] : 滑动效果
        this.i2 = 0;

        // # 关联 hooks
        // 元素: MetHook
        this.hooks = [];
        // # 操作的执行action performs
        // 元素: MetPerform
        this.performs = [];
    };

    /** constants */
    // # 操作类型type MetNodeActionType
    // 播放(autoplay)
    MetNodeAction.MetNodeActionTypeAuto = 0;
    // 点击(tap)
    MetNodeAction.MetNodeActionTypeTap = 1;
    // 双击(doubleTap)
    MetNodeAction.MetNodeActionTypeDoubleTap = 2;
    // 长按(longTap)
    MetNodeAction.MetNodeActionTypeLongTap = 3;
    // 缩放(zoom)
    MetNodeAction.MetNodeActionTypeZoom = 4;
    // 拖拽(drag)
    MetNodeAction.MetNodeActionTypeDrag = 5;
    // 滚动(scroll)
    MetNodeAction.MetNodeActionTypeScroll = 6;
    // 猛滑(slide)
    MetNodeAction.MetNodeActionTypeSlide = 7;
    // 擦除(erase)
    MetNodeAction.MetNodeActionTypeErase = 8;
    // 重力感应(gravity)
    MetNodeAction.MetNodeActionTypeGravity = 9;
    // 单点旋转(rotate)
    MetNodeAction.MetNodeActionTypeRotate = 10;
    // 双点扭转(twist)
    MetNodeAction.MetNodeActionTypeTwist = 11;
    // 被动关联(hooked)
    MetNodeAction.MetNodeActionHooked = 12;

    MetNodeAction.prototype.parseByDic = function(dic) {
        this.id_ = dic.id_ || "";
        this.actionType = dic.actionType || 0;
        this.f1 = dic.f1 || 0;
        this.f2 = dic.f2 || 0;
        this.f3 = dic.f3 || 0;
        this.f4 = dic.f4 || 0;
        this.f5 = dic.f5 || 0;
        this.i1 = dic.i1 || 0;
        this.i2 = dic.i2 || 0;
        this.hooks = [];
        for(var i in dic.hooks){
            var xdic = dic.hooks[i];
            var hk = new MetHook();
            hk.parseByDic(xdic);
            this.hooks.push(hk);
        }
        this.performs = [];
        for(var i in dic.performs){
            var xdic = dic.performs[i];
            var pf = new MetPerform();
            pf.parseByDic(xdic);
            this.performs.push(pf);
        }
    };

    MetNodeAction.parseActionsFromArray = function(array){
        var actions = [];
        for(var i in array){
            var xdic = array[i];
            var ac = new MetNodeAction();
            ac.parseByDic(xdic);
            actions.push(ac);
        }
        return actions;
    }

    MetNodeAction.hasEraseOneInActions = function(actions){
        for(var i in actions){
            var ac = actions[i];
            if(MetNodeAction.MetNodeActionTypeErase === ac.actionType)
                return true;
        }
        return false;
    }

    module.exports = MetNodeAction;
});