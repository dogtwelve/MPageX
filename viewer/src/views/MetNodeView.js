define(function(require, exports, module) {
    'use strict';
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Modifier      = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Draggable = require('famous/modifiers/Draggable');
    var Transform     = require('famous/core/Transform');
    var ModifierChain = require('famous/modifiers/ModifierChain');
    var RenderController = require("famous/views/RenderController");
    var TweenTransition    = require('famous/transitions/TweenTransition');
    var Lightbox = require('famous/views/Lightbox');
    var UnitConverter = require('tools/UnitConverter');
    var MotionPath = require('utils/MotionPath');
    var KeyFrameAnim = require('animations/KeyFrameAnim');
    var DebugUtils = require('utils/DebugUtils');

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
        //console.log(this.name + " containerSize(" + this.containerSize[0] + "," + this.containerSize[1] + ")");
        _listenToScroll.call(this);
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

    MetNodeView.prototype.initMetNode = function(holdersSync, rootParent) {
        // Ensures metnode always has a position modifier
        _createBaseModifier.call(this);

        var root = rootParent.add(this.modifierChain);

        root.add(this.renderController);

        if(this.type == "MetStateNode") {
            this.lightbox = new Lightbox();

            root.add(this.lightbox);
            this.stateGroup = [];
        }



        if (this.mainSurface) {
            for(var holder in holdersSync) {
                this.mainSurface.pipe(holdersSync[holder]);
            }
            this.add(this.mainSurface);
        }


        ////children metnodes processing
        var subMetNodes = this.metNodes;
        var subRoot = this;

        for(var metNode in subMetNodes) {
            if(this.type == "MetStateNode") {
                subRoot = new View();
                this.stateGroup.push(subRoot);
            }
            subMetNodes[metNode].initMetNode(holdersSync, subRoot);
        }

        this.showMetNode();

        if(this.type == "MetStateNode") {
            this.lightbox.show(this.stateGroup[1], function() {
                console.log(this.stateGroup[1]);
            }.bind(this));
        }

        if(this.curAnim) {
            this.curAnim.activeAnim();
        }
    };

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
                curve:TweenTransition.Curves.linear,
                duration: 0
            }
        );

    };

    MetNodeView.prototype.hideMetNode = function() {
        this.renderController.hide(
            {
                curve:TweenTransition.Curves.linear,
                duration: 0
            }
            //,
            //function() {
            //    //this.showMetNode();
            //    //now hide complete
            //}.bind(this)
        );
    };

    function _listenToScroll() {
        this._eventInput.on('ScrollUpdated', _updateScrollValue.bind(this));
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
            DebugUtils.log(this.name + " zPos_adjust=" + this.z_adjust);
            var subMetNodes = this.metNodes;
            for(var subMetNodenode in subMetNodes) {
                var newAdjustPosZ = subMetNodes[subMetNodenode].setMetNodePosAdjustZ(zPos + 1);
                zPos = newAdjustPosZ;
            }

        }

        return zPos;
    };

    MetNodeView.prototype.resetMetNodePosAdjustZ = function() {
        var subMetNodes = this.metNodes;
        this.z_adjust = 0;
        DebugUtils.log(this.name + " zPos_adjust reset=" + this.z_adjust);
        for(var subMetNodenode in subMetNodes) {
            subMetNodes[subMetNodenode].resetMetNodePosAdjustZ();
        }
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

                var trans = Transform.translate(posX, posY, this.zPosition + this.z_adjust);
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
