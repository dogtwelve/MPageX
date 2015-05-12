define(function(require, exports, module) {
    'use strict';
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Modifier      = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Draggable = require('famous/modifiers/Draggable');
    var Transform     = require('famous/core/Transform');
    var ModifierChain = require('famous/modifiers/ModifierChain');
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
        this.opacity = this.options.opacity;
        this.destination = this.options.destination;
        this.name = this.options.name;
        this.metNodes = [];
        this.containerSize = this.options.containerSize;
        console.log(this.name + " containerSize(" + this.containerSize[0] + "," + this.containerSize[1] + ")");
        _listenToScroll.call(this);
    }

    MetNodeView.DEFAULT_OPTIONS = {
        name: undefined,
        xPosition: 0.5,
        yPosition: 0.5,
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

    MetNodeView.prototype.activateMetNode = function(holdersSync, rootParent) {
        //this.mainSurface.pipe(scrollSync);

        // Ensures metnode always has a position modifier
        _createBaseModifier.call(this);

        rootParent.add(this.modifierChain).add(this);


        if (this.mainSurface) {
            for(var holder in holdersSync) {
                this.mainSurface.pipe(holdersSync[holder]);
            }

            this.add(this.mainSurface);
        }


        ////children metnodes processing
        var subMetNodes = this.metNodes;
        for(var metNode in subMetNodes) {
            subMetNodes[metNode].activateMetNode(holdersSync, this);
        }


    };

    function _listenToScroll() {
        this._eventInput.on('ScrollUpdated', _updateScrollValue.bind(this));
    }

    function _createBaseModifier() {
        var posX = this.xPosition * this.containerSize[0];
        var posY = this.yPosition * this.containerSize[1];
        var baseModifier = new Modifier({
            origin: [0, 0],
            align: [0, 0],
            transform: Transform.translate(posX, posY, this.zPosition)
        });

        console.log(this.name + ' pos(' + posX + ','+ posY + ')');

        this.modifierChain.addModifier(baseModifier);

        ////TODO:for draggable node, here is a temporary code snippet
        var draggable = new Draggable();
        this.modifierChain.addModifier(draggable);
        if (this.mainSurface) {
            draggable.subscribe(this.mainSurface);
        }
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
