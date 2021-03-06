define(function(require, exports, module) {
    'use strict';
    var RenderNode          = require('famous/core/RenderNode');
    var View                = require('famous/core/View');
    var Surface             = require('famous/core/Surface');
    var Modifier            = require('famous/core/Modifier');
    var GenericSync         = require('famous/inputs/GenericSync');
    var StateModifier       = require('famous/modifiers/StateModifier');
    var Draggable           = require('famous/modifiers/Draggable');
    var ContainerSurface    = require("famous/surfaces/ContainerSurface");
    var Transform           = require('famous/core/Transform');
    var ModifierChain       = require('famous/modifiers/ModifierChain');
    var TweenTransition     = require('famous/transitions/TweenTransition');
    var Timer               = require('famous/utilities/Timer');
    var Utility               = require('famous/utilities/Utility');
    var MetScrollview          = require('container/MetScrollview');
    var RenderController    = require("famous/views/RenderController");
    var MetLightbox            = require('container/MetLightbox');
    var MetButton           = require('container/MetButton');
    var UnitConverter       = require('tools/UnitConverter');
    var MotionPath          = require('utils/MotionPath');
    var KeyFrameAnim        = require('animations/KeyFrameAnim');
    var StateAnim           = require('animations/StateAnim');
    var DebugUtils          = require('utils/DebugUtils');
    var StageView          = require('views/StageView');
    var EventDispatcher     = require('input/EventDispatcher');
    var MetHook = require('actions/MetHook');
    var MetPerform = require('actions/MetPerform');
    var MetNodeAction = require('actions/MetNodeAction');

    var TransitionUtils = require('utils/TransitionUtils');

    function MetNodeView() {
        View.apply(this, arguments);
        this.modifiers = [];
        this.modifierChain = new ModifierChain();
        this.scrollProgress = 0;
        this.xPosition = this.options.xPosition;
        this.yPosition = this.options.yPosition;
        this.zPosition = this.options.zPosition;
        this.z_adjust = 0;
        this.scaleX = this.options.scaleX;
        this.scaleY = this.options.scaleY;
        this.skewX = this.options.skewX;
        this.skewY = this.options.skewY;
        this.originX = this.options.anchorX;
        this.originY = this.options.anchorY;
        this.rotationZ = this.options.rotation;
        this.rotationX =  0;
        this.rotationY =  0;
        this.opacity = this.options.opacity;
        this.destination = this.options.destination;
        this.name = this.options.name;
        this.metNodeId = this.options.metNodeId;
        this.type = this.options.type;
        this.metNodes = [];
        this.size = this.options.size;
        this.containerSize = this.options.containerSize;
        this.nodeDesc = this.options.nodeDescription;

        this.renderController = new RenderController();

        _setEventProcesser2Dispatcher.call(this);
        //_processEventBind.call(this);

        // 播放状态集控制对象
        this.curStateAnim = null;
        // 播放桢动画控制对象
        this.curKeyframeAnim = null;
        //
        this.nodeActions = null;
    }

    MetNodeView.DEFAULT_OPTIONS = {
        name: undefined,
        xPosition: 0.5,
        yPosition: 0.5,
        originX: 0,
        originY: 0,
        zPosition: 0,
        opacity: 1,
        destination: undefined,
        surfaceOptions: {
            size: [300, 300],
            content: 'This is a dummy',
            properties: {
                backgroundColor: 'blue',
                fontSize: '4em',
                padding: '.5em',
            }
        }
    };

    MetNodeView.prototype = Object.create(View.prototype);
    MetNodeView.prototype.constructor = MetNodeView;

    MetNodeView.prototype.addModifierAction = function(newModifier) {
        this.modifiers.push(newModifier);
        this.modifierChain.addModifier(newModifier);
    };

    MetNodeView.prototype.addSurface = function(newSurface) {
        this.mainSurface = newSurface;
    };

    MetNodeView.prototype.setFloatingSurface = function(newSurface) {
        this.floatingSurface = newSurface;
    };

    MetNodeView.prototype.setContainerSurface = function(newSurface) {
        this.containerSurface = newSurface;
    };


    MetNodeView.prototype.addSubMetNode = function(metNode) {
        this.metNodes.push(metNode);
    };

    MetNodeView.prototype.setPositionRatio = function(newX, newY) {
        this.xPosition = newX;
        this.yPosition = newY;
    };

    MetNodeView.prototype.setPositionPixels = function(newX, newY) {
        this.xPosition = UnitConverter.pixelsToRatioX(newX, this.containerSize[0]);
        this.yPosition = UnitConverter.pixelsToRatioY(newY, this.containerSize[1]);
    };

    MetNodeView.prototype.incrementPosition = function(incrX, incrY) {
        this.xPosition += incrX;
        this.yPosition += incrY;
    };

    MetNodeView.prototype.initMetSubNode = function(holdersSync, renderParent, nodeViewParent) {
        renderParent.add(this.renderController);

        var isStateKeyframe = (this.type == "MetStateKeyframeNode");

        // Ensures metnode always has a position modifier
        _createBaseModifier.call(this);
        var root = this;
        if (isStateKeyframe) {
            var containerSize = nodeViewParent ? nodeViewParent.size : [undefined, undefined];
            var container = new ContainerSurface({size: containerSize});
            root.add(container);
            root = container;

            if (this.mainSurface) {
                this.mainSurface.setOptions({
                    size: containerSize
                });
            }
        }
        root = root.add(new Modifier({size: this.size})).add(this.modifierChain);
        var chain = root;
        if (this.containerSurface) {
            chain.add(this.containerSurface);
            chain = this.containerSurface;
        }

        if (this.mainSurface) {
            _subscribeEvent(this, this.mainSurface);
            chain.add(this.mainSurface);
        }

        if (this.floatingSurface) {
            _subscribeEvent(this, this.floatingSurface);
            chain.add(this.floatingSurface);
        }

        // children metnodes processing
        var arr = this.metNodes;
        var rt = chain;

        if (this.type === "MetScrollNode") {
            rt = _setScrollHolder.call(this, rt);
        }

        if (!isStateKeyframe && this.nodeDesc.visible) {
            this.showMetNode();
        }

        for (var i in arr) {
            _subscribeEvent(this, arr[i]);
            arr[i].initMetSubNode(holdersSync, rt, this);
        }

        // show according by initial
        if (this.type === "MetStateNode") {
            if (!this.curStateAnim)
                this.curStateAnim = new StateAnim(this, this.nodeDesc.defaultState);
            this.curStateAnim.showState(this.curStateAnim.curStateIdx, false);
            if (this.nodeDesc.autoplay)
                this.curStateAnim.autoPlay();
        }
        else if (this.type === "ButtonNode") {
            if (!this.curStateAnim)
                this.curStateAnim = new StateAnim(this, this.nodeDesc.defaultSelected ? 1 : 0);
            this.curStateAnim.showState(this.curStateAnim.curStateIdx, false);
        }
        else if (this.type === "AudioNode") {
            if (!this.curStateAnim)
                this.curStateAnim = new StateAnim(this, 0);
            this.curStateAnim.showState(this.curStateAnim.curStateIdx, false);
        }
        else if (this.type === "VideoNode") {
            if (!this.curStateAnim)
                this.curStateAnim = new StateAnim(this, 0);
            this.curStateAnim.showState(this.curStateAnim.curStateIdx, false);
        }
        else if (this.type === "MetAnimNode") {
            if (!this.curKeyframeAnim)
                this.curKeyframeAnim = new KeyFrameAnim(this, this.nodeDesc.duration, this.nodeDesc.keyframes, this.nodeDesc.endlessLoop);
            this.curKeyframeAnim.activeAnim();
            if (!this.nodeDesc.autoplay)
                this.curKeyframeAnim.pauseAnim();
        }
    };

    MetNodeView.prototype.showMetNode = function() {
        this.renderController.show(this, null, null);
    };

    MetNodeView.prototype.hideMetNode = function() {
        this.renderController.hide(null, null);
    };

    MetNodeView.prototype.isMetNodeShown = function() {
        var array = this.renderController._renderables;
        if(array instanceof Array) {
            for (var i in array) {
                if (array[i] === this)
                    return true;
            }
        }
        return false;
    };

    MetNodeView.prototype.getEventDispatcher = function() {
        return this.eventDispatcher;
    };

    function _setScrollHolder(subRoot) {
        var isVert = this.nodeDesc.scrollDirection == 0;
        var direction = isVert ? Utility.Direction.Y : Utility.Direction.X;
        var scrollview = new MetScrollview({direction: direction});
        this.scrollView = scrollview;
        this.containerSurface.add(scrollview);
        var subMetNodes = this.metNodes;
        // calc contentSize for scroll
        var sz = [this.size[0], this.size[1]];
        var min_v = 0, max_v = 0;
        for (var i = 0; i < subMetNodes.length; i++) {
            var snode = subMetNodes[i];
            var v0 = 0, v1 = 0;
            if (isVert) {
                v0 = snode.yPosition * snode.containerSize[1] - snode.size[1] * snode.originY;
                v1 = v0 + snode.size[1];
            }
            else {
                v0 = snode.xPosition * snode.containerSize[0] - snode.size[0] * snode.originX;
                v1 = v0 + snode.size[0];
            }
            if (i == 0) {
                min_v = v0;
                max_v = v1;
            }
            else {
                min_v = Math.min(min_v, v0);
                max_v = Math.max(max_v, v1);
            }
        }
        sz[isVert ? 1 : 0] = max_v - min_v;

        subRoot = new View({size: sz});
        scrollview.sequenceFrom([subRoot]);
        var c_sz = sz[isVert ? 1 : 0];
        var v_sz = this.size[isVert ? 1 : 0];
        // setup footprints for scrollview
        var footprints = MetNodeAction.parseFootprintsFromArray(this.nodeDesc.footprints);
        var scroll_fts = [];
        if (footprints.length > 0) {
            for (var i = 0; i < footprints.length; i++) {
                var ft = footprints[i];
                scroll_fts.push(ft.f);
            }
        }
        else {
            for (var i = 0; ; i++) {
                var f = i * v_sz + v_sz / 2;
                if (f >= 0 + v_sz / 2 && f <= c_sz - v_sz / 2)
                    scroll_fts.push(f);
                else
                    break;
            }
        }
        if (scroll_fts.length > 0) {
            scroll_fts.sort(function (val1, val2) {
                if (val1 > val2) return 1;
                else if (val1 < val2) return -1;
            });
            var paging = this.nodeDesc.paging;
            scrollview.setOptions({footprinted: paging == 1 || paging == 2,});
            scrollview.setupFootprints(scroll_fts);
        }

        // contentOffset
        scrollview.setOffset(-this.nodeDesc.contentOffset);

        // events
        for (var i in subMetNodes) {
            //scrollview.subscribe(subMetNodes[i]);
            _subscribeEvent(scrollview, subMetNodes[i]);
        }

        if (this.mainSurface) {
            //scrollview.subscribe(this.mainSurface);
            _subscribeEvent(scrollview, this.mainSurface);
        }

        var _findFootprintByLocation = function (loc) {
            for (var i = 0; i < footprints.length; i++) {
                var ft = footprints[i];
                if (loc == ft.f) return ft;
            }
            return null;
        }

        scrollview.on("onFootprint", function (data) {
            var ft = _findFootprintByLocation(data.location);
            if (null == ft) return;
            for (var i = 0; i < ft.performs.length; i++) {
                var pf = ft.performs[i];
                pf.execute();
            }
        });
        scrollview.on("hookFootprint", function (data) {
            var ft = _findFootprintByLocation(data.location);
            if (null == ft) return;
            for (var i = 0; i < ft.hooks.length; i++) {
                var hk = ft.hooks[i];
                hk.executeStep(1 - Math.min(1, Math.abs(data.offset * 2 / v_sz)));
            }
        });
        scrollview.on("update", function () {
            if (!scrollview.isOnTopEdge() && !scrollview.isOnBottomEdge())
                window.event.stopPropagation();
        });

        return subRoot;
    }

    function _subscribeEvent(subscriber, src) {
        subscriber.subscribe(src);
    }

    function _setEventProcesser2Dispatcher() {
        //this.eventDispatcher = new EventDispatcher(function () {
        //    return _processEventBind.apply(this, arguments);
        //}.bind(this));


        var sync = new GenericSync(
            ['mouse', 'touch']
        );

        this._eventInput.pipe(sync);

        sync.on('start', function(data) {
            //DebugUtils.log("sync start " + this.metNodeId + " " +  data.velocity);
        }.bind(this));

        sync.on('update', function(data) {
            //DebugUtils.log("sync update " + this.metNodeId + " " +  data.velocity);
        }.bind(this));

        sync.on('end', function(data) {
            //DebugUtils.log("sync end " + this.metNodeId + " " +  data.velocity);
        }.bind(this));

        this._eventInput.pipe(new EventDispatcher(function () {
            return _processEventBind.apply(this, arguments);
        }.bind(this))).pipe(this._eventOutput);
    }

    function _processEventBind(type, data) {
        //[
        //    'click', 'mousedown', 'mousemove', 'mouseup', 'mouseleave',
        //    'touchstart', 'touchmove','touchend', 'touchcancel'
        //].forEach(function(type) {
        //        this._eventInput.on(type, function(event) {
        //
        //            //pipe to downstream if necc
        //            this._eventOutput.emit(type, event);
        //        }.bind(this))
        //    }.bind(this))

        if(type == 'click')
            DebugUtils.log("event type = " + type + " " + this.metNodeId + " _processEventBind type = " + this.type);

        //default, could be processed by downstream elements
        if(this.eventProcessed === true) {
            return true;
        }
        return false;
    }

    MetNodeView.prototype.createDisplacementModifier = function() {
        this.displacementPosX = 0;
        this.displacementPosY = 0;
        if (this.displacementModifier) {

            this.modifierChain.removeModifier(this.displacementModifier);
            delete this.displacementModifier;
        }
        this.displacementModifier = new Modifier({
            transform: function() {
                return Transform.translate(this.displacementPosX, this.displacementPosY, 0);
            }.bind(this)
        });

        this.modifierChain.addModifier(this.displacementModifier);
    };

    MetNodeView.prototype.setDisplacementPos = function(posX, posY) {
        this.displacementPosX = posX;
        this.displacementPosY = posY;
    };

    MetNodeView.prototype.setMetNodePosAdjustZ = function(zPos) {
        if(this.z_adjust === 0) {
            this.z_adjust = zPos;
            var subMetNodes = this.metNodes;
            for(var subMetNodenode in subMetNodes) {
                var newAdjustPosZ = subMetNodes[subMetNodenode].setMetNodePosAdjustZ(zPos + 2);
                zPos = newAdjustPosZ;
            }

            //DebugUtils.log(this.name + " zPos_adjust=" + this.z_adjust);

        }

        return zPos;
    };

    MetNodeView.prototype.resetMetNodePosAdjustZ = function() {
        var subMetNodes = this.metNodes;
        this.z_adjust = 0;
        for(var subMetNodenode in subMetNodes) {
            subMetNodes[subMetNodenode].resetMetNodePosAdjustZ();
        }

        //DebugUtils.log(this.name + " zPos_adjust reset=" + this.z_adjust);
    };

    MetNodeView.prototype.setMetNodeScaleX = function(scaleX) {
        this.scaleX = scaleX;
    };

    MetNodeView.prototype.setMetNodeScaleY = function(scaleY) {
        this.scaleY = scaleY;
    };

    MetNodeView.prototype.setMetNodeRotateX = function(rotateX) {
        this.rotationX = rotateX;
        if(rotateX !== 0) {
            this.setMetNodePosAdjustZ(this.z_adjust);
        } else {
            this.resetMetNodePosAdjustZ();
        }
        //DebugUtils.log(this.name + " rotationX=" + this.rotationX);
    };

    MetNodeView.prototype.setMetNodeRotateY = function(rotateY) {
        this.rotationY = rotateY;
        if(rotateY !== 0) {
            this.setMetNodePosAdjustZ(this.z_adjust);
        } else {
            this.resetMetNodePosAdjustZ();
        }
        //DebugUtils.log(this.name + " rotationY=" + this.rotationY);
    };

    MetNodeView.prototype.setMetNodeRotateZ = function(rotateZ) {
        this.rotationZ = rotateZ;
    };

    MetNodeView.prototype.setMetNodeOpacity = function(opacity) {
        this.opacity = opacity;
    };

    function _createBaseModifier() {

        // Used for comparing actions and making sure they are sorted in the right order.
        // In order to behave as expected, scaling must happen before rotation.
        // All others can be composed freely and follow scaling / rotation
        // This won't be a stable sort, but stability doesn't seem to make much difference for this.

        //this.sizeModifier = new Modifier({
        //    size: this.size
        //});
        //this.originModifier = new Modifier({
        //    origin: [this.originX, this.originY]
        //});
        //
        //this.rotZModifier = new Modifier({
        //        transform: function() {
        //            return Transform.rotateZ(this.rotationZ)
        //        }.bind(this)
        //    }
        //);
        //
        //this.rotXModifier = new Modifier({
        //        transform: function() {
        //            return Transform.rotateX(this.rotationX)
        //        }.bind(this)
        //    }
        //);
        //
        //this.rotYModifier = new Modifier({
        //        transform: function() {
        //            return Transform.rotateY(this.rotationY)
        //        }.bind(this)
        //    }
        //);
        //
        //this.scaleModifier = new Modifier({
        //        transform: function() {
        //            return Transform.scale(this.scaleX, this.scaleY, 1)
        //        }.bind(this)
        //    }
        //);
        //
        //this.posModifier = new Modifier({
        //
        //    transform: function() {
        //        var posX = Math.round(UnitConverter.ratioXtoPixels(this.xPosition, this.containerSize[0]));
        //        var posY = Math.round(UnitConverter.ratioXtoPixels(this.yPosition, this.containerSize[1]));
        //        //var z_adjust = 0;
        //        //if(this.rotationX !== 0) {
        //        //    z_adjust = this.size[1]/2;
        //        //}
        //        //if(this.rotationY !== 0) {
        //        //    z_adjust = z_adjust < this.size[0]/2 ? this.size[0]/2 : z_adjust;
        //        //}
        //        return Transform.translate(posX, posY, this.zPosition + this.z_adjust);
        //    }.bind(this)
        //});
        //
        //this.opacityModifier = new Modifier({
        //    opacity: function() {
        //        return this.opacity;
        //    }.bind(this)
        //});
        //
        //this.modifierChain.addModifier(this.sizeModifier);
        //this.modifierChain.addModifier(this.originModifier);
        //this.modifierChain.addModifier(this.scaleModifier);
        //this.modifierChain.addModifier(this.rotXModifier);
        //this.modifierChain.addModifier(this.rotYModifier);
        //this.modifierChain.addModifier(this.rotZModifier);
        //this.modifierChain.addModifier(this.opacityModifier);
        //this.modifierChain.addModifier(this.posModifier);

        /////////////////////  Below is combine modifier ///////////////
        this.baseModifier = new Modifier({
            size: this.size,
            origin: [this.originX, this.originY],
            align: [0, 0],
            opacity: function() {
                    return this.opacity;
                }.bind(this),

            transform: function() {

                var posX = Math.round(UnitConverter.ratioXtoPixels(this.xPosition, this.containerSize[0]));
                var posY = Math.round(UnitConverter.ratioXtoPixels(this.yPosition, this.containerSize[1]));
                var scale = Transform.scale(this.scaleX, this.scaleY, this.scaleZ);

                //var z_adjust = 0;
                //if(this.rotationX !== 0) {
                //    z_adjust = this.size[1];
                //}
                //
                //if(this.rotationY !== 0) {
                //    z_adjust = z_adjust < this.size[0] ? this.size[0] : z_adjust;
                //}

                var trans = Transform.translate(posX, posY, this.z_adjust);
                var rotate = Transform.rotate(this.rotationX, this.rotationY, this.rotationZ);

                var part_first = Transform.multiply(trans, rotate);
                return Transform.multiply(part_first, scale);
            }.bind(this)
        })

        this.modifierChain.addModifier(this.baseModifier);

        ////TODO:for draggable node, here is a temporary code snippet
        //var draggable = new Draggable();
        //this.modifierChain.addModifier(draggable);
        //if (this.mainSurface) {
        //    draggable.subscribe(this.mainSurface);
        //}

        //if(this.mainSurface) {
        //    this.mainSurface.on("click", function() {
        //        this.hideMetNode();
        //    }.bind(this));
        //}
        
        ////a temporary code snippet end
    }

    function _updateScrollValue(data) {
        this.scrollProgress += data.delta;
        _updateModifiers.call(this, data.delta);
    }

    function _updateModifiers(delta) {
        // Tell all the modifiers to update based on the current state of the world
        for (var i = 0; i < this.modifiers.length; i++) {
            var currentModifier = this.modifiers[i];
            currentModifier.checkAndUpdate(this.scrollProgress, delta);
        }
    }

    module.exports = MetNodeView;
});
