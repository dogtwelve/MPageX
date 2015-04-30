define(function(require, exports, module) {
    'use strict';
    var MetNodeView   = require('views/MetNodeView');
    var BgImageSurface   = require('surfaces/BgImageSurface');
    var UnitConverter = require('tools/UnitConverter');
    var Surface       = require('famous/core/Surface');
    var ImageSurface  = require('famous/surfaces/ImageSurface');

    function MetNodeFactory() {
          // Container to store created actors by name.
          this.metnodes = {};
    }

    MetNodeFactory.prototype.makeMetNode = function(name, type, content, classes, properties, size, opacity, scrollStart, scrollStop) {
        var newSurface;

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
            newSurface = new BgImageSurface({
                sizeMode: BgImageSurface.SizeMode.ASPECTFILL,
                content: content,
                properties: properties,
                classes: classes
            });
        }

        var newNode = new MetNodeView({
            name: name,
            zPosition: properties.zPosition,
            opacity: opacity !== undefined ? opacity : 1
        });

        newNode.addSurface(newSurface);

        this.metnodes[name] = newNode;

        return newNode;
    };

    MetNodeFactory.prototype.getMetNode = function(name) {
        return this.metnodes[name];
    };

    module.exports = MetNodeFactory;
});
