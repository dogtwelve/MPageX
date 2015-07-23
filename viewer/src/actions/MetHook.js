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
    function MetHook(){
        // # 操作ID - global unique
        this.id_ = "";
        // # 关联攻方
        this.source = {
            // # 关联节点的ID ------- 目前除了这个属性, 其它都没有什么egg usage.
            nodeID: "",
            // # 关联的属性
            // 参与联动的node对象的属性, 可以是x, y, w, h, contentOffsetX, contentOffsetY, opacity, rotation, scale, state
            // 也可以是类似 animation.time, animation.keyframe 这种 keypath
            propKeyPath: "",
            // # 属性变化从fromValue到toValue
            fromValue: "",
            // # 属性变化从fromValue到toValue
            toValue: "",
            // # 是否关联逆向起作用
            mutual: false,
        };
        // # 关联受方
        this.target = {
            // # 关联节点的ID ------- 目前除了这个属性, 其它都没有什么egg usage.
            nodeID: "",
            // # 关联的属性
            // 参与联动的node对象的属性, 可以是x, y, w, h, contentOffsetX, contentOffsetY, opacity, rotation, scale, state
            // 也可以是类似 animation.time, animation.keyframe 这种 keypath
            propKeyPath: "",
            // # 属性变化从fromValue到toValue
            fromValue: "",
            // # 属性变化从fromValue到toValue
            toValue: "",
            // # 是否关联逆向起作用
            mutual: false,
        };
    };

    MetHook.prototype.parseByDic = function(dic) {
        this.id_ = dic.id_ || "";

        this.source.nodeID = dic.source.nodeID || "";
        this.source.propKeyPath = dic.source.propKeyPath || "";
        this.source.fromValue = dic.source.fromValue || "";
        this.source.toValue = dic.source.toValue || "";
        this.source.mutual = dic.source.mutual || false;

        this.target.nodeID = dic.target.nodeID || "";
        this.target.propKeyPath = dic.target.propKeyPath || "";
        this.target.fromValue = dic.target.fromValue || "";
        this.target.toValue = dic.target.toValue || "";
        this.target.mutual = dic.target.mutual || false;
    };

    MetHook.prototype.execute = function(){
        if(MetPerform.MetNodeActionPerformNone == this.performType)
            return;
        alert("hook fired!! LOL!!!");
    }

    module.exports = MetHook;
});