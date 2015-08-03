/**
 * Created by sodemon on 2015/5/20.
 */
define(function (require, exports, module) {
	'use strict';

	var Timer = require("famous/utilities/Timer");
	var MetNodeFactory = null;
	require(["tools/MetNodeFactory"], function(mod){
		MetNodeFactory = mod;
	});


	/** @constructor */
	function MetPerform() {
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
	// 使用搭配: (performType, performParam1, performParam2)
	// 隐藏/解除隐藏hide/unhide, aNodeID, nil
	MetPerform.MetNodeActionPerformShowOrHideNode = 1;
	// 播放/暂停(animation|effect|video|autio|states) play/pause, anAnimationID, anEffectID, nil
	MetPerform.MetNodeActionPerformPlayStartOrStop = 2;
	// 状态跳转, aStateNodeID, state_index
	MetPerform.MetNodeActionPerformStateRedirect = 3;
	// 页面跳转, page_number, nil
	MetPerform.MetNodeActionPerformPageRedirect = 4;
	// 打开网⻚, url, nil
	MetPerform.MetNodeActionPerformOpenUrl = 5;
	// 打电话, phone_number, nil
	MetPerform.MetNodeActionPerformCall = 6;
	// 发邮件, email address, nil
	MetPerform.MetNodeActionPerformEmail = 7;
	// 编辑短信, default text, nil
	MetPerform.MetNodeActionPerformSMS = 8;
	// 保存图片, aNodeID, nil
	MetPerform.MetNodeActionPerformImageSave = 9;
	//摄像头，拍照替换shapenode填充的图片
	MetPerform.MetNodeActionPerformPageCamera = 10;
	//数据收集
	MetPerform.MetNodeActionPerformDataCollector = 11;

	MetPerform.prototype.parseByDic = function (dic) {
		this.id_ = dic.id_ || "";
		this.performType = dic.performType || 0;
		this.targetID = dic.targetID || "";
		this.stringParam = dic.stringParam || "";
		this.stringParam2 = dic.stringParam2 || "";
		this.longLongParam = dic.longLongParam || 0;
	};

	MetPerform.prototype.execute = function () {
		if(!MetNodeFactory) return;
		var nodeFactory = MetNodeFactory.sharedInstance();

		// 空执行
		if (MetPerform.MetNodeActionPerformNone == this.performType)
			return;
		// 使用搭配: (performType, performParam1, performParam2)
		// 隐藏/解除隐藏hide/unhide, aNodeID, nil
		else if (MetPerform.MetNodeActionPerformShowOrHideNode == this.performType) {
			var nodeView = nodeFactory.getMetNode(this.targetID);
			if(!nodeView)
				;
			else if(nodeView.isMetNodeShown())
				nodeView.hideMetNode();
			else
				nodeView.showMetNode();
		}
		// 播放/暂停(animation|video|autio|states) play/pause, aNodeID, nil
		else if (MetPerform.MetNodeActionPerformPlayStartOrStop == this.performType) {
			var nodeView = nodeFactory.getMetNode(this.targetID);
			if (!nodeView)
				;
			else if (nodeView.type === "MetAnimNode") {
			}
			else if (nodeView.type === "VideoNode") {
			}
			else if (nodeView.type === "AudioNode") {
			}
			else if (nodeView.type == "MetStateNode") {
			}
		}
		// 状态跳转, aStateNodeID, state_index
		else if (MetPerform.MetNodeActionPerformStateRedirect == this.performType) {
			var nodeView = nodeFactory.getMetNode(this.targetID);
			if(!nodeView)
				;
			else if(nodeView.type == "MetStateNode"){
				var state_index = Number(this.longLongParam);
			}
		}
		// 页面跳转, page_number, nil
		else if (MetPerform.MetNodeActionPerformPageRedirect == this.performType) {
			var page_number = Number(this.longLongParam);
		}
		// 打开网⻚, url, nil
		else if (MetPerform.MetNodeActionPerformOpenUrl == this.performType) {
			var url = this.stringParam;
		}
		// 打电话, phone_number, nil
		else if (MetPerform.MetNodeActionPerformCall == this.performType) {
			var phone_number = this.stringParam;
		}
		// 发邮件, email address, nil
		else if (MetPerform.MetNodeActionPerformEmail == this.performType) {
			var email = this.stringParam;
		}
		// 编辑短信, default text, nil
		else if (MetPerform.MetNodeActionPerformSMS == this.performType) {
			var text = this.stringParam;
		}
		// 保存图片, aNodeID, nil
		else if (MetPerform.MetNodeActionPerformImageSave == this.performType) {
			var nodeView = nodeFactory.getMetNode(this.targetID);
			if(!nodeView)
				;
			else if(nodeView.type == "ShapeNode") {
			}
		}
		//摄像头，拍照替换shapenode填充的图片
		else if (MetPerform.MetNodeActionPerformPageCamera == this.performType) {
			var nodeView = nodeFactory.getMetNode(this.targetID);
			if(!nodeView)
				;
			else if(nodeView.type == "ShapeNode") {
			}
		}
		//数据收集, aDataCollectorID
		else if (MetPerform.MetNodeActionPerformDataCollector == this.performType) {
			var nodeView = nodeFactory.getMetNode(this.targetID);
			if(!nodeView)
				;
			else if(nodeView.type == "MetDataCollectorNode") {
			}
		}
		else
			console.log("wrong perform!! LOL!!!");
	}

	module.exports = MetPerform;
});