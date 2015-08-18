/**
 * Created by sodemon on 2015/5/20.
 */
define(function (require, exports, module) {
    'use strict';

    var Timer = require("famous/utilities/Timer");

    var MetLightbox = require('container/MetLightbox');
    var EasingUtils = require('utils/EasingUtils');
    var TransitionUtils = require('utils/TransitionUtils');
    var TransformUtils = require('utils/TransformUtils');
    var Transitionable = require('famous/transitions/Transitionable');

    var MetNodeAction = null;
    require(['actions/MetNodeAction'], function (data) {
        MetNodeAction = data;
    });

    /** @constructor input a stateNode as the actor */
    function StateAnim(actor, curStateIndex) {
        this.actor = actor;
        this.curStateIdx = curStateIndex;
        this.totalStates = actor.metNodes.length;

        this.animTimer = null;
        this.hookTimer = null;
        this.stateConfigs = MetNodeAction.parseStatesFromArray(actor.nodeDesc.nodes);
        // assign states
        for(var i = 0; i < this.stateConfigs.length; i++){
            var t = 0;
            if(i < curStateIndex) t = -1;
            else if(i > curStateIndex) t = 1;
            var cfg = this.stateConfigs[i];
            cfg.tCache = new Transitionable(t);
        }

        // 初始化stateViewPlayer
        _initStateViewPlayer.call(this, actor);
        // 设置状态集切换事件处理
        _setupStateEventHandling.call(this, actor.containerSurface);
    };

    function _initStateViewPlayer(actor) {
        var options = TransitionUtils.synthesizeLightBoxOptions(actor.nodeDesc.transition, actor.size, [1, 1]);
        this.stateViewPlayer = new MetLightbox(options);
        if (actor.containerSurface) {
            actor.containerSurface.context.setPerspective(3000);
            actor.containerSurface.add(this.stateViewPlayer);
        }
        else
            actor.add(this.stateViewPlayer);
    }

    function _setupStateEventHandling(surface) {
        var self_ = this;
        var renderController = self_.stateViewPlayer;
        var curr_stateView = self_.actor.metNodes[self_.curStateIdx];
        var rewind = self_.actor.nodeDesc.endToEnd;
        var vsize = surface.getSize();
        // 确定操作状态集的操作方向
        var _wanaDirection4Transition = function (t) {
            return (t == 3 || t == 5) ? 1 : 0;
        };
        var changeDirection = _wanaDirection4Transition(self_.actor.nodeDesc.transition);

        // event handling
        var fromPos = null;
        // 0: vertical, 1: horrizontal, null: nothing
        var gestureDirection = null;
        var gestureTransition = null;
        // 保存潜在将进入的页面, 目前实现方式是在手势换页期间, 保有这两个页面, 在换页操作完成后, 再释放掉这两个页面
        var prev_stateView = null, next_stateView = null;
        // down
        var _on_down = function (e) {
            e.preventDefault();
            if (renderController.renderables.length > 1) return;
            fromPos = [e.clientX || e.changedTouches[0].clientX, e.clientY || e.changedTouches[0].clientY];
        };
        // move
        var _on_move = function (e) {
            e.preventDefault();

            if (null == fromPos) return;
            var toPos = [e.clientX || e.changedTouches[0].clientX, e.clientY || e.changedTouches[0].clientY];
            var delta = [toPos[0] - fromPos[0], toPos[1] - fromPos[1]];
            var trans = TransformUtils.transformFromElement(surface._currentTarget, document.body);
            delta = TransformUtils.vectorApplyTransform(delta, trans);

            // 移动足够多距离16px, 开始判断手势方向
            var gestureJustRecornized = false;
            if (null == gestureDirection) {
                if (Math.abs(delta[0]) + Math.abs(delta[1]) > 16) {
                    if (Math.abs(delta[1]) > Math.abs(delta[0])) {
                        if (changeDirection == 0) gestureDirection = 0;
                    }
                    else {
                        if (changeDirection == 1) gestureDirection = 1;
                    }
                }
                // 操作幅度较小不足以判断是否意图操作本状态集时, 阻断事件冒泡
                else
                    e.stopPropagation();

                if (null != gestureDirection)
                    gestureJustRecornized = true;
            }

            // 手势方向判断完成之前, 不做任何影响
            if (null == gestureDirection)
                return;

            if (null == gestureTransition && changeDirection == gestureDirection) {
                if (delta[1 - gestureDirection] > 0) {
                    if (null != self_.getStateViewByIndex(self_.curStateIdx - 1, rewind)) gestureTransition = self_.actor.nodeDesc.transition;
                }
                else {
                    if (null != self_.getStateViewByIndex(self_.curStateIdx + 1, rewind)) gestureTransition = self_.actor.nodeDesc.transition;
                }
            }
            if (null == gestureTransition)
                return;
            // 判断出意图操作并且可以操作本状态集, 当然更阻断事件冒泡
            else
                e.stopPropagation();

            // 无 - MetStateNodeContentSlidingStyleNone
            if (gestureTransition === 0)
                return;

            var t = Math.max(-1, Math.min(1, delta[1 - gestureDirection] / vsize[1 - gestureDirection]));
            _startHooking.call(self_);

            // 准备相邻页面
            if (gestureJustRecornized) {
                if (changeDirection == gestureDirection) {
                    prev_stateView = self_.getStateViewByIndex(self_.curStateIdx - 1, rewind);
                    next_stateView = self_.getStateViewByIndex(self_.curStateIdx + 1, rewind);
                }
            }

            // prev
            if (null != prev_stateView) {
                var already_shown = (renderController.stateItem4Renderable(prev_stateView) != null);
                var prev_options = TransitionUtils.synthesizeAnimateOptions(gestureTransition, t, -1, vsize, [gestureDirection, 1 - gestureDirection]);
                var should_show = prev_options.visible;
                var zIndex = prev_options.zIndex;
                if (zIndex > 0) zIndex++;
                if (should_show) {
                    if (!already_shown) {
                        renderController.addRenderable(prev_stateView, prev_options);
                        already_shown = true;
                    }
                }
                else {
                    if (already_shown) {
                        renderController.removeRenderable(prev_stateView);
                        already_shown = false;
                    }
                }
                if (already_shown) {
                    var cfg = self_.getStateConfigByIndex(self_.curStateIdx - 1, rewind);
                    cfg.tCache.set(t - 1);
                    renderController.modifyRenderableWithOptions(prev_stateView, prev_options);
                    prev_stateView.mainSurface.setProperties({zIndex: zIndex});
                }
            }
            // next
            if (null != next_stateView) {
                var already_shown = (renderController.stateItem4Renderable(next_stateView) != null);
                var next_options = TransitionUtils.synthesizeAnimateOptions(gestureTransition, t, +1, vsize, [gestureDirection, 1 - gestureDirection]);
                var should_show = next_options.visible;
                var zIndex = next_options.zIndex;
                if (zIndex > 0) zIndex++;
                if (should_show) {
                    if (!already_shown) {
                        renderController.addRenderable(next_stateView, next_options);
                        already_shown = true;
                    }
                }
                else {
                    if (already_shown) {
                        renderController.removeRenderable(next_stateView);
                        already_shown = false;
                    }
                }
                if (already_shown) {
                    var cfg = self_.getStateConfigByIndex(self_.curStateIdx + 1, rewind);
                    cfg.tCache.set(t + 1);
                    renderController.modifyRenderableWithOptions(next_stateView, next_options);
                    next_stateView.mainSurface.setProperties({zIndex: zIndex});
                }
            }
            // current
            {
                var already_shown = (renderController.stateItem4Renderable(curr_stateView) != null);
                var me_options = TransitionUtils.synthesizeAnimateOptions(gestureTransition, t, 0, vsize, [gestureDirection, 1 - gestureDirection]);
                var should_show = me_options.visible;
                var zIndex = me_options.zIndex;
                if (zIndex > 0) zIndex++;
                if (should_show) {
                    if (!already_shown) {
                        renderController.addRenderable(curr_stateView, me_options);
                        already_shown = true;
                    }
                }
                else {
                    if (already_shown) {
                        renderController.removeRenderable(curr_stateView);
                        already_shown = false;
                    }
                }
                if (already_shown) {
                    var cfg = self_.getStateConfigByIndex(self_.curStateIdx, rewind);
                    cfg.tCache.set(t);
                    renderController.modifyRenderableWithOptions(curr_stateView, me_options);
                    curr_stateView.mainSurface.setProperties({zIndex: zIndex});
                }
            }
        };
        // up
        var _on_up = function (e) {
            e.preventDefault();
            if (null == fromPos) return;
            var toPos = [e.clientX || e.changedTouches[0].clientX, e.clientY || e.changedTouches[0].clientY];
            var trans = TransformUtils.transformFromElement(surface._currentTarget, document.body);
            if(e.type == "mouseout"){
                var lpos = TransformUtils.pointApplyTransform(toPos, trans);
                if (!(lpos[0] < 0 || lpos[1] < 0 || lpos[0] > vsize[0] || lpos[1] > vsize[1])) return;
            }
            var delta = [toPos[0] - fromPos[0], toPos[1] - fromPos[1]];
            delta = TransformUtils.vectorApplyTransform(delta, trans);
            fromPos = null;

            if (null == gestureDirection) return;

            // 三个页面中, 需要留下来的, 作为第一个参数winner. 另外两个则分别为loser1, loser2
            var __stateChangeCommit = function (winner, loser1, loser2, t0, off0, t1, off1, t2, off2, transition) {
                // 为新的页面设置同样的事件处理机制
                if (null != winner && winner != curr_stateView) {
                    var options = TransitionUtils.synthesizeLightBoxOptions(transition, vsize, [gestureDirection, 1 - gestureDirection]);
                    renderController.setOptions(options);
                }

                // 提交页面改变
                var me_options = TransitionUtils.synthesizeAnimateOptions(gestureTransition, t0, off0, vsize, [gestureDirection, 1 - gestureDirection]);
                var l1_options = TransitionUtils.synthesizeAnimateOptions(gestureTransition, t1, off1, vsize, [gestureDirection, 1 - gestureDirection]);
                var l2_options = TransitionUtils.synthesizeAnimateOptions(gestureTransition, t2, off2, vsize, [gestureDirection, 1 - gestureDirection]);
                var options_rc = renderController.options;
                // --- tCache transitionable
                for(var i = 0; i < self_.stateConfigs.length; i++) {
                    var cfg = self_.stateConfigs[i];
                    if (i < self_.curStateIdx) {
                        if (cfg.tCache.get() != -1) cfg.tCache.set(-1, options_rc.inTransition, null);
                    }
                    else if (i > self_.curStateIdx) {
                        if (cfg.tCache.get() != +1) cfg.tCache.set(+1, options_rc.inTransition, null);
                    }
                    else {
                        if (cfg.tCache.get() != 0) cfg.tCache.set(0, options_rc.inTransition, null);
                    }
                }
                // --- lightbox animations
                if (null == renderController.stateItem4Renderable(winner))
                    renderController.addRenderable(winner, null);
                renderController.animateRenderableWithFromToOptions(winner, options_rc.inTransition, null, me_options, function () {
                    renderController.removeRenderable(loser1);
                    renderController.removeRenderable(loser2);
                    winner.mainSurface.setProperties({zIndex: 2});

                    _stopHooking.call(self_);
                    if(winner != curr_stateView) _executePerforms.call(self_);
                });
                renderController.animateRenderableWithFromToOptions(loser1, options_rc.inTransition, null, l1_options, null);
                renderController.animateRenderableWithFromToOptions(loser2, options_rc.inTransition, null, l2_options, null);
            };
            var changed = false;
            if (!changed && changeDirection == gestureDirection) {
                // prev chapter
                if (delta[1 - gestureDirection] > vsize[1 - gestureDirection] / 3) {
                    if (null != prev_stateView) {
                        if(rewind)
                            self_.curStateIdx = (self_.curStateIdx + self_.actor.metNodes.length - 1) % self_.actor.metNodes.length;
                        else
                            self_.curStateIdx--;
                        __stateChangeCommit(prev_stateView, curr_stateView, next_stateView, 1, -1, 1, 0, 1, 1, gestureTransition);
                        changed = true;
                    }
                }
                // next chapter
                else if (delta[1 - gestureDirection] < -vsize[1 - gestureDirection] / 3) {
                    if (null != next_stateView) {
                        if(rewind)
                            self_.curStateIdx = (self_.curStateIdx + 1) % self_.actor.metNodes.length;
                        else
                            self_.curStateIdx++;
                        __stateChangeCommit(next_stateView, prev_stateView, curr_stateView, -1, 1, -1, -1, -1, 0, gestureTransition);
                        changed = true;
                    }
                }
            }
            if (!changed)
                __stateChangeCommit(curr_stateView, prev_stateView, next_stateView, 0, 0, 0, -1, 0, 1, null);
            else
                curr_stateView = self_.actor.metNodes[self_.curStateIdx];

            prev_stateView = null;
            next_stateView = null;
            gestureDirection = null;
            gestureTransition = null;
        };
        surface.on("mousedown", _on_down);
        surface.on("touchstart", _on_down);
        surface.on("mousemove", _on_move);
        surface.on("touchmove", _on_move);
        surface.on("mouseout", _on_up);
        surface.on("touchcancel", _on_up);
        surface.on("mouseup", _on_up);
        surface.on("touchend", _on_up);
    }

    function _startHooking(){
        if(null != this.hookTimer) return;
        this.hookTimer = Timer.every(_executeHooking.bind(this), 1);
    }

    function _executeHooking() {
        for (var j = 0; j < this.stateConfigs.length; j++) {
            var cfg = this.stateConfigs[j];
            var t = cfg.tCache.get();
            for (var i = 0; i < cfg.hooks.length; i++) {
                var hk = cfg.hooks[i];
                hk.executeStep(1 - Math.abs(t));
            }
        }
    }

    function _stopHooking(){
        if (this.hookTimer) {
            Timer.clear(this.hookTimer);
            this.hookTimer = null;
        }
    }

    function _executePerforms(){
        var cfg = this.stateConfigs[this.curStateIdx];
        if (null == cfg) return;
        for (var i = 0; i < cfg.performs.length; i++) {
            var pf = cfg.performs[i];
            pf.execute();
        }
    }

    StateAnim.prototype.showState = function (idx, animated) {
        var changed = this.curStateIdx != idx;
        if (changed) {
            this.curStateIdx = idx;
            _startHooking.call(this);
        }

        var _cb = function () {
            _stopHooking.call(this);
            if (changed) _executePerforms.call(this);
        }.bind(this);

        var transition = animated ? null : {duration: 0};
        if(changed) {
            // --- tCache transitionable
            for (var i = 0; i < this.stateConfigs.length; i++) {
                var cfg = this.stateConfigs[i];
                if (i < this.curStateIdx) {
                    if (cfg.tCache.get() != -1) cfg.tCache.set(-1, transition, null);
                }
                else if (i > this.curStateIdx) {
                    if (cfg.tCache.get() != +1) cfg.tCache.set(+1, transition, null);
                }
                else {
                    if (cfg.tCache.get() != 0) cfg.tCache.set(0, transition, null);
                }
            }
        }

        var stateKeyframe = this.actor.metNodes[this.curStateIdx];
        var player = this.stateViewPlayer;
        if (!player.options.together) {
            player.hide(null, transition, function () {
                player.show(stateKeyframe, transition, _cb);
            }.bind(this));
        }
        else {
            player.hide(null, transition, null);
            player.show(stateKeyframe, transition, _cb);
        }
    };

    StateAnim.prototype.showNextState = function () {
        var subMetNodes = this.actor.metNodes;
        var idx = 0;
        if (rewind)
            idx = (this.curStateIdx + 1) % subMetNodes.length;
        else if (this.curStateIdx < subMetNodes.length - 1)
            idx = this.curStateIdx + 1;
        this.showState(idx, true);
    };

    StateAnim.prototype.showPreState = function () {
        var subMetNodes = this.actor.metNodes;
        var idx = 0;
        if (rewind)
            idx = (this.curStateIdx + subMetNodes.length - 1) % subMetNodes.length;
        else if (this.curStateIdx > 0)
            idx = this.curStateIdx - 1;
        this.showState(idx, true);
    };

    StateAnim.prototype.autoPlay = function () {
        this.stopPlay();
        this.animTimer = Timer.setInterval(
            function () {
                this.showNextState();
            }.bind(this),
            this.actor.duration || 1000
        );
    };

    StateAnim.prototype.stopPlay = function () {
        if (this.animTimer) {
            Timer.clear(this.animTimer);
            this.animTimer = null;
        }
    };

    StateAnim.prototype.isPlaying = function () {
        return null != this.animTimer;
    };

    StateAnim.prototype.getStateViewByIndex = function (index, rewind) {
        var subMetNodes = this.actor.metNodes;
        var len = subMetNodes.length;
        if(rewind){
            while(index < 0) index += len;
            while(index >= len) index -= len;
        }
        if (index < 0 || index > len - 1)
            return null;
        return subMetNodes[index];
    };

    StateAnim.prototype.getStateConfigByIndex = function (index, rewind) {
        var cfgs = this.stateConfigs;
        var len = cfgs.length;
        if (rewind) {
            while (index < 0) index += len;
            while (index >= len) index -= len;
        }
        if (index < 0 || index > len - 1)
            return null;
        return cfgs[index];
    };

    StateAnim.prototype.getAnimProcess = function () {
        var cfg = this.getStateConfigByIndex(this.curStateIdx, false);
        var tc = cfg.tCache.get();
        var b = Math.max(1, this.totalStates - 1);
        return (this.curStateIdx - tc) / b;
    };

    module.exports = StateAnim;
});

//也许切页 && 状态集吸附, 需要处理惯性问题?
//var velocity = data.velocity;
//
//if(velocity < - 0.35) {
//    this.curStateAnim.showNextState();
//}
//
//if(velocity > 0.35) {
//    this.curStateAnim.showPreState();
//}