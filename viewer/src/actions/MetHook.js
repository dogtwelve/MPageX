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
	function MetHook() {
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

	MetHook.prototype.parseByDic = function (dic) {
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

	MetHook.prototype.execute = function () {
		if(!MetNodeFactory) return;
		var nodeFactory = MetNodeFactory.sharedInstance();
		var src_nodeView = nodeFactory.getMetNode(this.source.nodeID || 0);
		var dst_nodeView = nodeFactory.getMetNode(this.target.nodeID || 0);
		if(!src_nodeView || !dst_nodeView)
			return;

		// means MetScrollNode.contentOffset hook
		if(src_nodeView.type == "MetScrollNode") {
		}
	}

	// execute one hook step identified t
	// where t is normalized in range [0,1].
	MetHook.prototype.executeStep = function (t) {
		if (!MetNodeFactory) return;
		var nodeFactory = MetNodeFactory.sharedInstance();
		var src_nodeView = nodeFactory.getMetNode(this.source.nodeID || 0);
		var dst_nodeView = nodeFactory.getMetNode(this.target.nodeID || 0);
		if (!src_nodeView || !dst_nodeView)
			return;

		// means MetScrollNode.footprint.f hook
		if (src_nodeView.type == "MetScrollNode") {
			if (dst_nodeView.type == "MetAnimNode") {
			}
			else if (dst_nodeView.type == "MetStateNode") {
			}
			else console.log("hook not dealled for TARGET " + dst_nodeView.type);
		}
		// means MetAnimNode.keyframe hook
		else if (src_nodeView.type == "MetAnimNode") {
		}
		// means MetStateNode.keyframe hook
		else if (src_nodeView.type == "MetStateNode") {
		}
		// others
		else console.log("hook not dealled for SOURCE " + src_nodeView.type);
	}

	module.exports = MetHook;
});