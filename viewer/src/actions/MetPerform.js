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
    function MetPerform(){
        // # 操作ID - global unique
        this.id_ = "";
		// # 执行方式
		// 类型 MetNodeActionPerformType
	    this.performType = 0;
		// # 操作对象, 根据performType不同有不同的意义.
		this.targetID = "";
		// # 字符串执行参数, 根据performType不同有不同的使用方式.
		this.stringParam = "";
		// # 字符串执行参数, 根据performType不同有不同的使用方式.
		this.stringParam2 = "";
		// # 数字执行参数, 根据performType不同有不同的使用方式.
	    this.longLongParam = 0;
    };

	// ------------------------------------------------------
	// 使用搭配: (performType, performParam1, performParam2)
	// ------------------------------------------------------
	// 空执行
	MetPerform.MetNodeActionPerformNone = 0;
	// 解除隐藏unhide, aNodeID, nil, nil
	MetPerform.MetNodeActionPerformShowNode = 1;
	// 隐藏/hide, aNodeID, nil, nil
	MetPerform.MetNodeActionPerformHideNode = 2;
	// 播放/暂停(animation|effect|video|autio|states) play/pause, anAnimationID, anEffectID, nil
	MetPerform.MetNodeActionPerformPlayStart = 3;
	MetPerform.MetNodeActionPerformPlayStop = 4;
	MetPerform.MetNodeActionPerformPlaySwitch = 5;
	// 状态切换, aStateNodeID, nil
	MetPerform.MetNodeActionPerformStateChange = 6;
	// 状态跳转, aStateNodeID, state_index
	MetPerform.MetNodeActionPerformStateRedirect = 7;
	// 滚动, aNodeID, nil
	MetPerform.MetNodeActionPerformScroll = 8;
	// 打开网⻚, url, nil
	MetPerform.MetNodeActionPerformOpenUrl = 9;
	// 打电话, phone_number, nil
	MetPerform.MetNodeActionPerformCall = 10;
	// 发邮件, email address, nil
	MetPerform.MetNodeActionPerformEmail = 11;
	// 编辑短信, default text, nil
	MetPerform.MetNodeActionPerformSMS = 12;
	// 保存图片, aNodeID, nil
	MetPerform.MetNodeActionPerformImageSave = 13;
	// 页面跳转, page_number, nil
	MetPerform.MetNodeActionPerformPageRedirect = 14;

    MetPerform.prototype.parseByDic = function(dic){
        this.id_ = dic.id_ || "";
        this.performType = dic.performType || 0;
        this.targetID = dic.targetID || "";
        this.stringParam = dic.stringParam || "";
        this.stringParam2 = dic.stringParam2 || "";
        this.longLongParam = dic.longLongParam || 0;
    };

    module.exports = MetPerform;
});
