define(function(require, exports, module) {
    'use strict';
    var MetNodeView   = require('views/MetNodeView');
    var BgImageSurface   = require('surfaces/BgImageSurface');
    var UnitConverter = require('tools/UnitConverter');
    var Surface       = require('famous/core/Surface');
    var ImageSurface  = require('famous/surfaces/ImageSurface');
    var UnitConverter      = require('tools/UnitConverter');

    function MetNodeFactory() {
          // Container to store created actors by name.
          this.metNodesFromFactory = {};
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

        var subMetNodes = nodeDescription.nodes;
        for(var subMetNodenode in subMetNodes) {
            var newSubNode = this.makeMetNodeNew(
                subMetNodes[subMetNodenode].name,
                subMetNodes[subMetNodenode],
                nodeDescription.size);
            newNode.addSubMetNode(newSubNode);
        }

        newNode.addSurface(newSurface);


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
