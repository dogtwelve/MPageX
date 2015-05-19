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
    var UnitConverter = require('tools/UnitConverter');

    function MetNodeView() {
        View.apply(this, arguments);
        this.modifiers = [];
        this.modifierChain = new ModifierChain();
        this.scrollProgress = 0;
        this.xPosition = this.options.xPosition;
        this.yPosition = this.options.yPosition;
        this.zPosition = this.options.zPosition;
        this.scaleX = this.options.scaleX;
        this.scaleY = this.options.scaleY;
        this.skewX = this.options.skewX;
        this.skewY = this.options.skewY;
        this.originX = this.options.anchorX;
        this.originY = this.options.anchorY;
        this.rotation = this.options.rotation;
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
                backfaceVisibility: 'visible'
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

        rootParent.add(this.modifierChain).add(this.renderController);


        if (this.mainSurface) {
            for(var holder in holdersSync) {
                this.mainSurface.pipe(holdersSync[holder]);
            }
            this.add(this.mainSurface);
        }


        ////children metnodes processing
        var subMetNodes = this.metNodes;
        for(var metNode in subMetNodes) {
            subMetNodes[metNode].initMetNode(holdersSync, this);
        }

        this.showMetNode();
    };

    MetNodeView.prototype.setActivated = function() {
        this.timer = 0;
    };

    MetNodeView.prototype.isActivated = function() {
        return this.timer >= 0 ? true : false;
    };

    MetNodeView.prototype.setMetAnimKeyFrames = function(metAnimKeyFrames) {
        this.metAnimKeyFrames = metAnimKeyFrames;
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

        if(this.type == "MetAnimNode") {
            this.updateAnimKeyFrames(elapsed);
        }
    };

    MetNodeView.prototype.updateAnimKeyFrames = function(elapsed) {
        this.timer += elapsed;
    }

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
    }

    function _createBaseModifier() {
        var posX = Math.round(UnitConverter.ratioXtoPixels(this.xPosition, this.containerSize[0]));
        var posY = Math.round(UnitConverter.ratioXtoPixels(this.yPosition, this.containerSize[1]));
        this.baseModifier = new Modifier({
            size: this.size,
            align: [0, 0],
            origin: [this.originX, this.originY],
            transform: function() {
                return Transform.translate(posX, posY, this.zPosition);
            }.bind(this)
        });

        console.log(this.name + ' pos(' + posX + ','+ posY + ')' + ' align(' + this.originX + ','+ this.originY + ')');

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
