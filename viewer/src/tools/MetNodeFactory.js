define(function(require, exports, module) {
    'use strict';
    var MetNodeView   = require('views/MetNodeView');
    var BgImageSurface   = require('surfaces/BgImageSurface');
    var UnitConverter = require('tools/UnitConverter');
    var Surface       = require('famous/core/Surface');
    var ImageSurface  = require('famous/surfaces/ImageSurface');
    var CanvasSurface  = require('famous/surfaces/CanvasSurface');
    var UnitConverter      = require('tools/UnitConverter');

    function MetNodeFactory() {
          // Container to store created actors by name.
          this.metNodesFromFactory = {};
    }

    MetNodeFactory.prototype.makeMetNode = function(nodeDescription, containerSize) {

        if (nodeDescription.zPosition && nodeDescription.properties) {
            nodeDescription.properties.zPosition = nodeDescription.zPosition;
        }

        var type = nodeDescription.class;
        var name = nodeDescription.name;
        var id = nodeDescription.id_;
        var opacity = nodeDescription.opacity;
        var scaleX = nodeDescription.scaleX;
        var scaleY = nodeDescription.scaleY;
        var skewX = nodeDescription.skewX;
        var skewY = nodeDescription.skewY;
        var anchorX = nodeDescription.anchorX;
        var anchorY = nodeDescription.anchorY;
        var rotation = nodeDescription.rotation;
        // Make sure size is in pixels.
        var size = UnitConverter._unitsToPixels([nodeDescription.sizeX, nodeDescription.sizeY], containerSize);

        var classes = ['z2'];
        var fillColor = decimalToHexColorString(nodeDescription.colorFill.fillColor);


        var newSurface;


        var newNode = new MetNodeView({
            size: size,
            metNodeId: id,
            name: name,
            zPosition: 0,
            opacity: opacity !== undefined ? opacity : 1,
            scaleX: scaleX,
            scaleY: scaleY,
            skewX: skewX,
            skewY: skewY,
            anchorX: anchorX,
            anchorY: anchorY,
            rotation: rotation,
            containerSize:containerSize
        });

        if(type === "ShapeNode") {
            newSurface = new Surface({
                size: size,
                content: name,
                properties: {
                    backfaceVisibility: 'visible',
                    backgroundColor: fillColor
                },
                classes: classes
            });

            newNode.addSurface(newSurface);
        }

        if(type === "MetNode") {
            newSurface = new Surface({
                size: size,
                content: name,
                properties: {
                    backfaceVisibility: 'visible',
                    border: '1px solid rgb(210, 208, 203)'
                },
                classes: classes
            });

            newNode.addSurface(newSurface);
        }


        var subMetNodes = nodeDescription.nodes;
        for(var subMetNodenode in subMetNodes) {
            var newSubNode = this.makeMetNode(
                subMetNodes[subMetNodenode],
                size);
            newNode.addSubMetNode(newSubNode);
        }

        this.metNodesFromFactory[name] = newNode;

        newNode.setPositionPixels(nodeDescription.positionX, nodeDescription.positionY);

        console.log(name +
            //" Pos(" + UnitConverter.ratioXtoPixels(newNode.xPosition, containerSize[0]) + "," + UnitConverter.ratioXtoPixels(newNode.yPosition + containerSize[1]) + ") " +
            " Size(" + size[0] + "," + size[1] + ") " +
            " fillColor=" + fillColor);

        return newNode;

    }

    function decimalToHexColorString(number)
    {
        var colorStr = ((number>> 8) & 0xFFFFFF).toString(16).toUpperCase();
        //padding if necessary
        return "#" + "000000".substr(0, 6 - colorStr.length) + colorStr;
    }

    MetNodeFactory.prototype.makeMetNodeNew = function(name, nodeDescription, containerSize) {
        var newSurface;

        if (nodeDescription.zPosition && nodeDescription.properties) {
            nodeDescription.properties.zPosition = nodeDescription.zPosition;
        }

        // Make sure size is in pixels.
        nodeDescription.size = UnitConverter._unitsToPixels(nodeDescription.size, containerSize);

        // Make sure position is in pixels.
        if (nodeDescription.position) {
            nodeDescription.position = UnitConverter._unitsToPixels(nodeDescription.position, containerSize);
        }


        var type = nodeDescription.type;
        var content = nodeDescription.content;
        var classes = nodeDescription.classes;
        var properties = nodeDescription.properties;
        var size = nodeDescription.size;
        var opacity = nodeDescription.opacity;

        // Ensure backface visibility is set for all new surfaces.
        if (!classes) {
            classes = ['backfaceVisibility'];
        } else {
            classes.push('backfaceVisibility');
        }

        if (type === 'html') {
            newSurface = new Surface({
                size: size,
                content: content,
                properties: properties,
                classes: classes
            });
            //newSurface = new CanvasSurface({
            //    size: size,
            //    properties: properties,
            //    classes: classes
            //});
            //newSurface.render = function render() {
            //
            //    var ctx = this.getContext('2d');
            //
            //    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            //
            //    //ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            //    //ctx.moveTo(10, i);
            //    //ctx.lineTo(60, i);
            //    //ctx.stroke();
            //
            //    //if (i++ > ctx.canvas.height) i = 0;
            //
            //    return this.id;
            //};

        }

        if (type === 'image') {
            //newSurface = new BgImageSurface({
            //    sizeMode: BgImageSurface.SizeMode.ASPECTFILL,
            //    content: content,
            //    properties: properties,
            //    classes: classes
            //});
            newSurface = new ImageSurface({
                    size: size,
                    content: content,
                    properties: properties,
                    classes: classes
            });
        }

        var newNode = new MetNodeView({
            name: name,
            zPosition: properties.zPosition,
            opacity: opacity !== undefined ? opacity : 1,
            containerSize:containerSize
        });

        newNode.addSurface(newSurface);

        var subMetNodes = nodeDescription.nodes;
        for(var subMetNodenode in subMetNodes) {
            var newSubNode = this.makeMetNodeNew(
                subMetNodes[subMetNodenode].name,
                subMetNodes[subMetNodenode],
                nodeDescription.size);
            newNode.addSubMetNode(newSubNode);
        }




        this.metNodesFromFactory[name] = newNode;

        newNode.setPositionPixels(nodeDescription.position[0], nodeDescription.position[1]);

        return newNode;
    };

    //MetNodeFactory.prototype.makeMetNode = function(name, type, content, classes, properties, size, opacity, scrollStart, scrollStop) {
    //    var newSurface;
    //
    //    // Ensure backface visibility is set for all new surfaces.
    //    if (!classes) {
    //        classes = ['backfaceVisibility'];
    //    } else {
    //        classes.push('backfaceVisibility');
    //    }
    //
    //    if (type === 'html') {
    //        newSurface = new Surface({
    //            size: size,
    //            content: content,
    //            properties: properties,
    //            classes: classes
    //        });
    //    }
    //
    //    if (type === 'image') {
    //        //newSurface = new BgImageSurface({
    //        //    sizeMode: BgImageSurface.SizeMode.ASPECTFILL,
    //        //    content: content,
    //        //    properties: properties,
    //        //    classes: classes
    //        //});
    //        newSurface = new ImageSurface({
    //            size: size,
    //            content: content,
    //            properties: properties,
    //            classes: classes
    //        });
    //    }
    //
    //    var newNode = new MetNodeView({
    //        name: name,
    //        zPosition: properties.zPosition,
    //        opacity: opacity !== undefined ? opacity : 1
    //    });
    //
    //    newNode.addSurface(newSurface);
    //
    //    this.metnodes[name] = newNode;
    //
    //    return newNode;
    //};

    MetNodeFactory.prototype.getMetNode = function(name) {
        return this.metNodesFromFactory[name];
    };

    module.exports = MetNodeFactory;
});
