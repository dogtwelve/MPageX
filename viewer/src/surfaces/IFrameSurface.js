define(function(require, exports, module) {
    'use strict';

    var Surface = require('famous/core/Surface');

    function IFrameSurface(options) {
        this._url = undefined;
        Surface.apply(this, arguments);
    }

    IFrameSurface.prototype = Object.create(Surface.prototype);
    IFrameSurface.prototype.constructor = IFrameSurface;
    IFrameSurface.prototype.elementType = 'iframe';
    IFrameSurface.prototype.elementClass = 'famous-surface';

    IFrameSurface.prototype.setContent = function setContent(url) {
        this._url = url;
        this._contentDirty = true;
    };

    IFrameSurface.prototype.deploy = function deploy(target) {
        target.src = this._url || '';
    };

    IFrameSurface.prototype.recall = function recall(target) {
        target.src = '';
    };

    module.exports = IFrameSurface;
});
