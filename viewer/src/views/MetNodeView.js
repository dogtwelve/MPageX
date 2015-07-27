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
    var RenderController    = require("famous/views/RenderController");
    var TweenTransition     = require('famous/transitions/TweenTransition');
    var Timer               = require("famous/utilities/Timer");
    var Utility               = require("famous/utilities/Utility");
    var MetScrollview          = require('container/MetScrollview');
    var MetLightbox            = require('container/MetLightbox');
    var UnitConverter       = require('tools/UnitConverter');
    var MotionPath          = require('utils/MotionPath');
    var KeyFrameAnim        = require('animations/KeyFrameAnim');
    var DebugUtils          = require('utils/DebugUtils');
    var StageView          = require('views/StageView');

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
        this.renderController = new RenderController();
        this.timer = -1;
        this.nodeDesc = this.options.nodeDescription;
        //console.log(this.name + " containerSize(" + this.containerSize[0] + "," + this.containerSize[1] + ")");
        //_listenToScroll.call(this);
        _listenToAction.call(this);
        _processEventBind.call(this);
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

    MetNodeView.prototype.initMetStateNode = function(holdersSync) {
        _createBaseModifier.call(this);

        var root = this.add(new Modifier({size: this.size})).add(this.modifierChain);

        if (this.mainSurface) {
            //this._eventOutput.subscribe(this.mainSurface);
            _subscribeEvent(this, this.mainSurface);
            root.add(this.mainSurface);
        }


        ////children metnodes processing
        var subMetNodes = this.metNodes;
        var subRoot = root;

        for(var metNode in subMetNodes) {
            //this._eventOutput.subscribe(subMetNodes[metNode]);
            _subscribeEvent(this, subMetNodes[metNode]);
            subMetNodes[metNode].initMetSubNode(holdersSync, subRoot);
        }

        if(this.curAnim) {
            this.curAnim.activeAnim();
        }
    }

    MetNodeView.prototype.initMetSubNode = function(holdersSync, rootParent) {
        // Ensures metnode always has a position modifier
        _createBaseModifier.call(this);

        var root = this.add(new Modifier({size: this.size})).add(this.modifierChain);

        rootParent.add(this.renderController);

        //this._eventInput.on('metview-click',function(data) {
        //    if(this instanceof MetNodeView) {
        //        DebugUtils.log(this.metNodeId + " on metview-click event from " + data.metNodeId);
        //    } else if(this instanceof StageView) {
        //        DebugUtils.log("StageView on metview-click event from " + data.metNodeId);
        //    } else {
        //        DebugUtils.log("other on metview-click event from " + data.metNodeId);
        //    }
        //
        //}.bind(this));

        //var classes = ['z2', 'backfaceVisibility'];

        if(this.containerSurface) {
            root.add(this.containerSurface);
        }

        if (this.mainSurface) {
            //for(var holder in holdersSync) {
            //    this.mainSurface.pipe(holdersSync[holder]);
            //}

            //this._eventOutput.subscribe(this.mainSurface);
            _subscribeEvent(this, this.mainSurface);
            //this.mainSurface.pipe(rootParent._eventOutput);
            if(this.containerSurface) {
                this.containerSurface.add(this.mainSurface);
            } else {
                root.add(this.mainSurface);
            }

            //this.mainSurface.on("click", function(data){
            //    //this.hideMetNode();
            //    DebugUtils.log(this.metNodeId + " mainSurface event click");
            //    //rootParent._eventOutput.trigger('metview-click', {metNodeId:this.metNodeId} );
            //}.bind(this));


        }

        if(this.floatingSurface){
            var centerModifier = new Modifier({
                size: this.floatingSurface.size,
                align : [0.5, 0.5],
                origin : [0.5, 0.5]
            });

            //this._eventOutput.subscribe(this.floatingSurface);
            _subscribeEvent(this, this.floatingSurface);
            //this.mainSurface.pipe(rootParent._eventOutput);
            if(this.containerSurface) {
                this.containerSurface.add(centerModifier).add(this.floatingSurface);
            } else {
                root.add(centerModifier).add(this.floatingSurface);
            }
        }

        ////children metnodes processing
        var subMetNodes = this.metNodes;
        var subRoot = root;

        if(this.type === "MetStateNode") {
            subRoot = _setStatePlayer.call(this, subRoot);
        }

        if(this.type === "MetScrollNode") {
            subRoot = _setScrollHolder.call(this, subRoot);
        }


        this.showMetNode();

        for(var metNode in subMetNodes) {
            //if(subMetNodes[metNode].type === "MetScrollNode")
            //{
            //    console.log("no subscribe MetScrollNode");
            //} else {
            //    this._eventOutput.subscribe(subMetNodes[metNode]);
            //}
            _subscribeEvent(this, subMetNodes[metNode]);

            ////subMetNodes[metNode].pipe(subRoot);
            //subMetNodes[metNode].initMetNode(holdersSync, subRoot);

            if(this.type === "MetStateNode") {
                subMetNodes[metNode].initMetStateNode(holdersSync);
            } else {
                subMetNodes[metNode].initMetSubNode(holdersSync, subRoot);
            }
        }

        //if(this.type == "MetScrollNode") {
        //    MetScrollview.sequenceFrom([subRoot]);
        //}




        if(this.type === "MetStateNode") {
            this.curStateIdx = this.nodeDesc.defaultState;
            this.stateShowElapsed = 2000;
            this.showState();
        }

        if(this.type === "MetAnimNode" && (this.nodeDesc.autoplay || true)) {
            if(!this.curAnim) {
                this.setKeyFrameAnim(this.nodeDesc.keyframes, this.nodeDesc.duration, this.nodeDesc.autoreverses);
            }

            this.curAnim.activeAnim();
        }
    };

    MetNodeView.prototype.showState = function() {
        var originStateKeyframe = this.stateViewPlayer.renderables[this.stateViewPlayer.renderables.length - 1];
        var stateKeyframe = this.metNodes[this.curStateIdx];
        if(!this.stateViewPlayer.options.together)
            this.stateViewPlayer.hide(originStateKeyframe, null, function(){
                this.stateViewPlayer.show(stateKeyframe, null, null);
            });
        else {
            this.stateViewPlayer.hide(originStateKeyframe, null, null);
            this.stateViewPlayer.show(stateKeyframe, null, null);
        }
    };

    MetNodeView.prototype.showNextState = function() {
        var subMetNodes = this.metNodes;
        this.curStateIdx = (this.curStateIdx + 1) % subMetNodes.length;
        this.showState();
    }

    MetNodeView.prototype.showPreState = function() {
        var subMetNodes = this.metNodes;
        this.curStateIdx = (this.curStateIdx + subMetNodes.length - 1) % subMetNodes.length;
        this.showState();
    }

    MetNodeView.prototype.setActivated = function() {
        this.timer = 0;
    };

    MetNodeView.prototype.isActivated = function() {
        return this.timer >= 0 ? true : false;
    };

    MetNodeView.prototype.setKeyFrameAnim = function(metKeyFramesAnim, duration, loop) {
        this.curAnim = new KeyFrameAnim(this, duration, metKeyFramesAnim, loop);
    };

    MetNodeView.prototype.updateMetNode = function(elapsed) {
        ////children metnodes processing
        var subMetNodes = this.metNodes;
        for(var metNode in subMetNodes) {
            var subMetNode = subMetNodes[metNode];
            if(subMetNode.isActivated()) {
                subMetNode.updateMetNode(elapsed);
            }
        }
    };

    MetNodeView.prototype.showMetNode = function() {
        this.renderController.show(this,
            {
                //curve:TweenTransition.Curves.linear,
                duration: 0
            }
        );

        //DebugUtils.log(this.name +
        //" Size(" + this.size[0] + "," + this.size[1] + ") " +
        //" zPosition=" + this.zPosition +
        //" id_=" + this.metNodeId);

    };

    MetNodeView.prototype.hideMetNode = function() {
        this.renderController.hide(
            {
                //curve:TweenTransition.Curves.linear,
                duration: 0
            }
            ,
            function() {
                this.showMetNode();
                //now hide complete
            }.bind(this)
        );
    };

    function _setStatePlayer(subRoot) {
        var centerModifier = new Modifier({
            size: this.size,
            align : [0.5, 0.5],
            origin : [0.5, 0.5]
        });

        this.stateViewPlayer = new MetLightbox(TransitionUtils.synthesizeLightBoxOptions(this.nodeDesc.transition, this.size, [1, 1]));
        this.containerSurface.add(this.stateViewPlayer);
        return subRoot;
    }

    function _setScrollHolder(subRoot) {
        var direction = this.nodeDesc.scrollDirection == 0 ? Utility.Direction.Y : Utility.Direction.X;
        var scrollview = new MetScrollview({ direction: direction});
        this.containerSurface.add(scrollview);
        var subMetNodes = this.metNodes;
        subRoot = new View();
        scrollview.sequenceFrom([subRoot]);

        for(var metNode in subMetNodes) {
            //scrollview.subscribe(subMetNodes[metNode]);
            _subscribeEvent(scrollview, subMetNodes[metNode]);
        }

        if(this.mainSurface) {
            //scrollview.subscribe(this.mainSurface);
            _subscribeEvent(scrollview, this.mainSurface);
        }

        scrollview.on("click", function(data){
            DebugUtils.log("scrollview event:" + data);
        }.bind(this));

        return subRoot;
    }

    //function _listenToScroll() {
    //    this._eventInput.on('ScrollUpdated', _updateScrollValue.bind(this));
    //};

    function _subscribeEvent(subscriber, src) {
        subscriber.subscribe(src);
    }

    function _processEventBind() {
        [
            'click', 'mousedown', 'mousemove', 'mouseup', 'mouseleave',
            'touchstart', 'touchmove','touchend', 'touchcancel'
        ].forEach(function(type) {
                this._eventInput.on(type, function(event) {

                    //pipe to downstream if necc
                    this._eventOutput.emit(type, event);
                }.bind(this))
            }.bind(this))
    }

    function _listenToAction() {

        //this.on("click", function(data){
        //    DebugUtils.log(this.metNodeId + " type = " + this.type + " view event click");
        //}.bind(this));

        ////anim node pause and resume temp test
        //if(this.type == "MetAnimNode") {
        //    this.on('click', function(data) {
        //        DebugUtils.log(this.metNodeId + " type = " + this.type + " view event click");
        //        if(this.curAnim.isPaused() === true) {
        //            this.curAnim.resumeAnim();
        //        } else {
        //            this.curAnim.pauseAnim();
        //        }
        //    }.bind(this));
        //}

        if(this.type === "MetStateNode") {
            var sync = new GenericSync(
                ['mouse', 'touch'],
                {direction : GenericSync.DIRECTION_X}
            );

            //this.on('click', function(data) {
            //    DebugUtils.log(this.metNodeId + " type = " + this.type + " view event click");
            //    this.showNextState();
            //}.bind(this));

            this.pipe(sync);


            sync.on('start', function(data) {
                //var currentPosition = this.pageViewPos.get();
                //if(currentPosition === 0 && data.velocity > 0) {
                //    this.menuView.animateStrips();
                //}
                //
                //this.pageViewPos.set(Math.max(0, currentPosition + data.delta));
                //DebugUtils.log("MetStateNode update " + data.velocity);
            }.bind(this));

            sync.on('update', function(data) {
                //var currentPosition = this.pageViewPos.get();
                //if(currentPosition === 0 && data.velocity > 0) {
                //    this.menuView.animateStrips();
                //}
                //
                //this.pageViewPos.set(Math.max(0, currentPosition + data.delta));
                //DebugUtils.log("MetStateNode update " + data.velocity);
            }.bind(this));

            sync.on('end', (function(data) {
                //var velocity = data.velocity;
                //var position = this.pageViewPos.get();
                //
                //if(this.pageViewPos.get() > this.options.posThreshold) {
                //    if(velocity < -this.options.velThreshold) {
                //        this.slideLeft();
                //    } else {
                //        this.slideRight();
                //    }
                //} else {
                //    if(velocity > this.options.velThreshold) {
                //        this.slideRight();
                //    } else {
                //        this.slideLeft();
                //    }
                //}

                var velocity = data.velocity;

                if(velocity < - 0.35) {
                    this.showNextState();
                }

                if(velocity > 0.35) {
                    this.showPreState();
                }
            }).bind(this));
        }
        else {
            //this.on('click', function(data) {
            //    DebugUtils.log(this.metNodeId + " type = " + this.type + " view event click");
            //}.bind(this));
        }
    };

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
