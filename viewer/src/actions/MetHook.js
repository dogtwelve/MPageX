/**
 * Created by sodemon on 2015/5/20.
 */
define(function (require, exports, module) {
    'use strict';

    var MetNodeFactory = null;
    require(['tools/MetNodeFactory'], function (m) {
        MetNodeFactory = m;
    });
    var MetNodeAction = null;
    require(['actions/MetNodeAction'], function (m) {
        MetNodeAction = m;
    });
    var Timer = require("famous/utilities/Timer");

    /** @constructor */
    function MetHook() {
        // # 操作ID - global unique
        this.id_ = "";
        // # 关联攻方
        this.source = {
            // # 关联节点的ID
            nodeID: "",
            // # 关联页面的ID
            pageID: "",
            // # 关联的属性
            propKeyPath: ""
        };
        // # 关联受方
        this.target = {
            // # 关联节点的ID ------- 目前除了这个属性, 其它都没有什么egg usage.
            nodeID: "",
            // # 关联页面的ID
            pageID: "",
            // # 关联的属性
            propKeyPath: ""
            // # 属性变化从fromValue到toValue
        };
        // - 关联对应的action类型
        this.actionType = -1;
        // - 源对象类型
        this.srcType = "";
        // - 标对象类型
        this.dstType = "";
    };

    MetHook.prototype.parseByDic = function (dic) {
        this.id_ = dic.id_ || "";

        this.source.nodeID = dic.source.nodeID || "";
        this.source.pageID = dic.source.pageID || "";
        this.source.propKeyPath = dic.source.propKeyPath || "";

        this.target.nodeID = dic.target.nodeID || "";
        this.target.pageID = dic.target.pageID || "";
        this.target.propKeyPath = dic.target.propKeyPath || "";
    };

    // -- 对于各种节点, 可能配置的交互类型 --
    // MetScrollNode -- [1, 2, 6]
    // MetAnimNode -- [0, 1, 2, 6]
    // MetStateNode -- [0, 1, 2, 6]
    // VideoNode -- [1]
    // AudioNode -- [1]
    // TextNode -- [1, 2, 3, 4, 5, 7, 8, 9]
    // ShapeNode -- [1, 2, 3, 4, 5, 7, 8, 9]
    // MetLineNode -- [1, 2, 3, 4, 5, 7, 8, 9]
    // ButtonNode -- []
    // MetDataCollectorNode -- []
    // MetNode -- [1, 2, 3, 4, 5, 7, 9]

    // 关联的参与者必须是滚动, 动画, 状态集, 或者拥有"猛划"action的物体
    function _isValidHookOperator(nodeView) {
        if ("MetScrollNode" == nodeView.type || "MetAnimNode" == nodeView.type || "MetStateNode" == nodeView.type)
            return true;
        if (MetNodeAction.hasSlideOneInActions(nodeView.nodeActions))
            return true;
        return false;
    }

    // 返回Normalized的状态量参数
    function _getParameter4HookOperator(nodeView) {
        if ("MetScrollNode" == nodeView.type) {
            var scroll = nodeView.scrollView;
            var a = scroll.getOffset();
            var b = Math.max(1, scroll.getContentSizeForDirection());
            return a / b;
        }
        else if ("MetAnimNode" == nodeView.type) {
            var keyframeAnim = nodeView.curKeyframeAnim;
            var a = keyframeAnim.curAnimTime;
            var b = Math.max(1, keyframeAnim.totalAnimTime);
            return a / b;
        }
        else if ("MetStateNode" == nodeView.type) {
            var stateAnim = nodeView.curStateAnim;
            return stateAnim ? stateAnim.getAnimProcess() : 0;
        }
        else if (MetNodeAction.hasSlideOneInActions(nodeView.nodeActions)) {
            var act = MetNodeAction.findInActionsByActionType(nodeView.nodeActions, MetNodeAction.MetNodeActionTypeSlide);
            if (null != act) {
                var fromX = nodeView.nodeDesc.positionX, fromY = nodeView.nodeDesc.positionY;
                var toX = act.f2, toY = act.f4;
                var curX = nodeView.xPosition * newNode.containerSize[0], curY = nodeView.yPosition * newNode.containerSize[1];

                if (fromX != toX)
                    return (curX - fromX) / (toX - fromX);
                else if (fromY != toY)
                    return (curY - fromY) / (toY - fromY);
            }
        }
        return 0;
    }

    // 设置状态量参数
    function _setParameter4HookOperator(nodeView, t) {
        if ("MetScrollNode" == nodeView.type) {
            var scroll = nodeView.scrollView;
            var b = Math.max(1, scroll.getContentSizeForDirection());
            scroll.setOffset(t * b);
        }
        else if ("MetAnimNode" == nodeView.type) {
            var keyframeAnim = nodeView.curKeyframeAnim;
            var b = Math.max(1, keyframeAnim.totalAnimTime);
            keyframeAnim.gotoTime(b * t);
        }
        else if ("MetStateNode" == nodeView.type) {
            var stateAnim = nodeView.curStateAnim;
            var a = stateAnim.curStateIdx;
            var b = stateAnim.totalStates - 1;
            var c = Math.min(b, Math.max(0, Math.floor(t * b + 0.5)));
            if (c != a) {
                stateAnim.showState(c, true);
            }
        }
        else if (MetNodeAction.hasSlideOneInActions(nodeView.nodeActions)) {
            var act = MetNodeAction.findInActionsByActionType(nodeView.nodeActions, MetNodeAction.MetNodeActionTypeSlide);
            if (null != act) {
                var fromX = nodeView.nodeDesc.positionX, fromY = nodeView.nodeDesc.positionY;
                var toX = act.f2, toY = act.f4;
                //var curX = nodeView.xPosition * newNode.containerSize[0], curY = nodeView.yPosition * newNode.containerSize[1];
                var curX = t * (toX - fromX) + fromX, curY = t * (toY - fromY) + fromY;
                nodeView.xPosition = curX * nodeView.containerSize[0];
                nodeView.yPosition = curY * nodeView.containerSize[1];
            }
        }
    }

    // true means src make dst change
    // false means src is changed by dst
    MetHook.prototype.executeSync = function (normal) {
        var src_nodeView = this.getSrcNodeView();
        var dst_nodeView = this.getDstNodeView();
        if (!src_nodeView || !dst_nodeView)
            return;

        if (!_isValidHookOperator(src_nodeView) || !_isValidHookOperator(dst_nodeView))
            return;

        // exec hooking
        var src = normal ? src_nodeView : dst_nodeView;
        var dst = normal ? dst_nodeView : src_nodeView;
        _setParameter4HookOperator(dst, _getParameter4HookOperator(src));
    };

    // execute one hook step identified t
    // where t is normalized in range [0,1].
    MetHook.prototype.executeStep = function (t) {
        var src_nodeView = this.getSrcNodeView();
        var dst_nodeView = this.getDstNodeView();
        if (!src_nodeView || !dst_nodeView)
            return;

        if (!_isValidHookOperator(src_nodeView) || !_isValidHookOperator(dst_nodeView))
            return;

        _setParameter4HookOperator(dst_nodeView, t);
    };

    MetHook.prototype.getSrcType = function () {
        if (this.srcType == "") {
            var nodeView = this.getSrcNodeView();
            this.srcType = nodeView.type || "";
        }
        return this.srcType;
    };

    MetHook.prototype.getDstType = function () {
        if (this.dstType == "") {
            var nodeView = this.getDstNodeView();
            if (nodeView)
                this.dstType = nodeView.type || "";
            else
                this.dstType = "none";
        }
        return this.dstType;
    };

    MetHook.prototype.getSrcNodeView = function () {
        var nodeFactory = MetNodeFactory.sharedInstance();
        return nodeFactory.getMetNode(this.source.nodeID);
    };

    MetHook.prototype.getDstNodeView = function () {
        var nodeFactory = MetNodeFactory.sharedInstance();
        return nodeFactory.getMetNode(this.target.nodeID);
    };

    var __hookTimer = null;
    var __hooksIds = [];
    var __hooksArray = [];

    // 手势操作的节点在此数组里纪录, 在关联的过程当中, 要以它们为主动节点
    var __activeNodeIDS = [];

    // A: the algo is similar with MetHook.prototype.flagActiveNodeID
    // B: 执行之后, 会把部分hook过滤掉, 避免一个hook被执行多次, 通过返回值的方式体现
    function ____runHooksSpreadFromNodeID(node_id, hks) {
        // 遍历__hooksArray中的关联关系, 使得包含node_id的关联分支中最多一个active的node, 其它的inactive it.
        var ids = [node_id];
        while (ids.length > 0) {
            var array = [];
            for (var i in ids) {
                var nid = ids[i];
                var j = 0;
                while (j < hks.length) {
                    var hk = hks[j];
                    if (hk.source.nodeID == nid) {
                        if (hk.target.nodeID != nid && "" != hk.target.nodeID) {
                            hk.executeSync(true);
                            array.push(hk.target.nodeID);
                        }
                        hks.splice(j, 1);
                        j--;
                    }
                    else if (hk.target.nodeID == nid) {
                        if (hk.source.nodeID != nid && "" != hk.source.nodeID) {
                            hk.executeSync(false);
                            array.push(hk.source.nodeID);
                        }
                        hks.splice(j, 1);
                        j--;
                    }
                    j++;
                }
            }
            ids = array;
        }
        return hks;
    }

    // A: 在所有的手势引发的关联执行完后, 检查剩余的hooks中是否有autoplay的hook, 并且由这些autoplay-hooks扩散开的各个关联
    // B: 执行之后, 会把部分hook过滤掉, 避免一个hook被执行多次, 通过返回值的方式体现
    function ____runHooksSpreadFromAutoPlayHook(autohk, hks) {
        var node_id = null;
        // 0: 播放(autoplay)
        if (autohk.actionType == 0)
            node_id = autohk.source.nodeID;
        // target is an autoplaying object
        else
            node_id = autohk.target.nodeID;
        hks = ____runHooksSpreadFromNodeID(node_id, hks);
        return hks;
    }

    function __runHooks() {
        // make a copy for __hooksArray
        var hks = [];
        for (var i in __hooksArray) hks.push(__hooksArray[i]);

        // 执行由手势引发的关联
        for (var i in __activeNodeIDS) {
            hks = ____runHooksSpreadFromNodeID(__activeNodeIDS[i], hks);
        }

        // 执行由自动播放导致的关联
        var autohooks = [];
        for (var i in hks) {
            var hk = hks[i];
            if (hk.actionType == 0)
                autohooks.push(hk);
            else if (hk.getDstType() == "MetAnimNode") {
                var dst_nodeView = hk.getDstNodeView();
                if (!dst_nodeView.curKeyframeAnim.isPaused())
                    autohooks.push(hk);
            }
            else if (hk.getDstType() == "MetStateNode") {
                var dst_nodeView = hk.getDstNodeView();
                if (dst_nodeView.curStateAnim.isPlaying())
                    autohooks.push(hk);
            }
        }
        for (var i in autohooks) {
            var autohk = autohooks[i];
            hks = ____runHooksSpreadFromAutoPlayHook(autohk, hks);
        }
    }

    function _startHookTimerIfNeeded() {
        if (null != __hookTimer) return;
        if (__hooksIds.length == 0) return;
        __hookTimer = Timer.every(__runHooks, 1);
    }

    function _stopHookTimerIfNothing() {
        if (null == __hookTimer) return;
        if (__hooksIds.length > 0) return;
        Timer.clear(__hookTimer);
        __hookTimer = null;
    }

    MetHook.isHookRegistered = function (hk) {
        if (!hk || !hk.id_) return false;
        return __hooksIds.indexOf(hk.id_) != -1;
    };

    MetHook.registerHook = function (hk, actionType) {
        if (MetHook.isHookRegistered(hk)) return;
        __hooksIds.push(hk.id_);
        __hooksArray.push(hk);
        hk.actionType = actionType;
        _startHookTimerIfNeeded();
    };

    MetHook.unregisterHook = function (hk) {
        if (!MetHook.isHookRegistered(hk)) return;
        var index = __hooksIds.indexOf(hk.id_);
        __hooksIds.splice(index, 1);
        __hooksArray.splice(index, 1);
        _stopHookTimerIfNothing();
    };

    MetHook.unregisterAllHooks = function () {
        __hooksIds.length = 0;
        __hooksArray.length = 0;
        _stopHookTimerIfNothing();
    };

    // 手势操作的节点在数组__activeNodeIDS里纪录, 在关联的过程当中, 要以它们为主动节点
    // 要遍历__hooksArray中的关联关系, 使得在一个关联分支中只有最多一个active的node.
    MetHook.flagActiveNodeID = function (node_id) {
        if (!node_id) return;

        var index = __activeNodeIDS.indexOf(node_id);
        if (index == -1) {
            // make a copy for __hooksArray
            var hks = [];
            for (var i in __hooksArray) hks.push(__hooksArray[i]);

            // 遍历__hooksArray中的关联关系, 使得包含node_id的关联分支中最多一个active的node, 其它的inactive it.
            var ids = [node_id];
            while (ids.length > 0) {
                var array = [];
                for (var i in ids) {
                    var nid = ids[i];
                    var j = 0;
                    while (j < hks.length) {
                        var hk = hks[j];
                        if (hk.source.nodeID == nid) {
                            if (hk.target.nodeID != nid && "" != hk.target.nodeID) {
                                MetHook.flagInactiveNodeID(hk.target.nodeID);
                                array.push(hk.target.nodeID);
                            }
                            hks.splice(j, 1);
                            j--;
                        }
                        else if (hk.target.nodeID == nid) {
                            if (hk.source.nodeID != nid && "" != hk.source.nodeID) {
                                MetHook.flagInactiveNodeID(hk.source.nodeID);
                                array.push(hk.source.nodeID);
                            }
                            hks.splice(j, 1);
                            j--;
                        }
                        j++;
                    }
                }
                ids = array;
            }
            __activeNodeIDS.push(node_id);
        }
    };

    MetHook.flagInactiveNodeID = function (node_id) {
        var index = __activeNodeIDS.indexOf(node_id);
        if (index != -1) __activeNodeIDS.splice(index, 1);

        // 被明确标记Inactive的节点, 顺便停止自动播放
        var nodeFactory = MetNodeFactory.sharedInstance();
        var nodeView = nodeFactory.getMetNode(node_id);
        if (nodeView.type == "MetAnimNode") {
            if (!nodeView.curKeyframeAnim.isPaused())
                nodeView.curKeyframeAnim.pauseAnim();
        }
        else if (nodeView.type == "MetStateNode") {
            if (nodeView.curStateAnim.isPlaying())
                nodeView.curStateAnim.stopPlay();
        }
    };

    module.exports = MetHook;
});