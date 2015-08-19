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

	//using Singleton JavaScript Module Pattern
	var OverlayViewFactory = (function () {
		var instance;

		function createInstance() {
			var object = new OverlayView();
			return object;
		}

		return {
			getInstance: function () {
				if (!instance) {
					instance = createInstance();
				}
				return instance;
			}
		};
	})();

	function OverlayView() {

		View.apply(this, arguments);
		//_initRootNode.call(this);
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

	OverlayView.prototype.initRootNode = function() {

		var pageScale = OverlayView.getPageContainerScale(this.containerSize[0], this.containerSize[1], this.projSize[0], this.projSize[1]);
		var modifier = new Modifier({
			align: [0.5, 0.5],
			transform: Transform.scale(pageScale, pageScale, 1),
		});

		this.rootNode = this.add(modifier);
	}

	OverlayView.getPageContainerScale = function(viewportW, viewportH, origW, origH){
		var scaleX = viewportW / origW;
		var scaleY = viewportH / origH;
		return Math.min(scaleX, scaleY);
	}

	OverlayView.prototype.setOpt = function(opt) {
		var overlay = OverlayViewFactory.getInstance();
		overlay.setOptions(opt);
		this.projSize = opt.projSize;
		this.containerSize = opt.containerSize;
	}


	function _subscribeEvent(subscriber, src) {
		subscriber.subscribe(src);
	}

	module.exports = OverlayView;
	module.exports.OverlayViewFactory = OverlayViewFactory;
});
