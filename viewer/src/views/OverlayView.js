define(function(require, exports, module) {
	'use strict';
	var Engine        = require('famous/core/Engine');
	var Timer         = require('famous/utilities/Timer');
	var Transform           = require('famous/core/Transform');
	var View          = require('famous/core/View');
	var Surface       = require('famous/core/Surface');
	var ContainerSurface = require('famous/surfaces/ContainerSurface');
	var Modifier      = require('famous/core/Modifier');

	var ImageSurface  = require('famous/surfaces/ImageSurface');

	var GenericSync   = require('famous/inputs/GenericSync');
	var MouseSync     = require('famous/inputs/MouseSync');
	var TouchSync     = require('famous/inputs/TouchSync');
	var ScrollSync    = require('famous/inputs/ScrollSync');

	var MetScrollview = require('container/MetScrollview');
	var RenderNode = require('famous/core/RenderNode');

	var UnitConverter = require('tools/UnitConverter');
	var DebugUtils = require('utils/DebugUtils');
	var TextUtils = require('utils/TextUtils');

	GenericSync.register({
		'mouse': MouseSync,
		'touch': TouchSync,
		'scroll': ScrollSync
	});

	function OverlayView() {
		View.apply(this, arguments);
		this.projSize = this.options.projSize;
		this.pageSize = this.options.pageSize;
		this.containerSize = this.options.containerSize;

		_initRootNode.call(this);
	}

	OverlayView.DEFAULT_OPTIONS = {
		velThreshold: 0.75,
		arrowData: {
			breakpoints: [0],
			speed: 4,
			step: 10
		},
	};

	OverlayView.prototype = Object.create(View.prototype);
	OverlayView.prototype.constructor = OverlayView;

	OverlayView.prototype.addMetNode = function(newNode) {
		newNode.initMetSubNode([/*this.syncScroll, this.syncSwipe*/], this.rootNode);
		_subscribeEvent(this, newNode);
	};

	function _initRootNode() {
		var classes = ['z2'];

		var rootModifier = new Modifier({
			size: this.pageSize,
			origin: [0.5, 0],
			align: [0.5, 0],
		});

		var renderNode = new RenderNode();

		this.rootNode = renderNode.add(rootModifier);
	}

	OverlayView.getPageContainerScale = function(viewportW, viewportH, origW, origH){
		var scaleX = viewportW / origW;
		var scaleY = viewportH / origH;
		return Math.min(scaleX, scaleY);
	}

	function _subscribeEvent(subscriber, src) {
		subscriber.subscribe(src);
	}

	module.exports = OverlayView;
});
