define(function(require, exports, module) {
	var Transform = require('famous/core/Transform');
	var Modifier = require('famous/core/Modifier');
	var RenderNode = require('famous/core/RenderNode');
	var Utility = require('famous/utilities/Utility');
	var OptionsManager = require('famous/core/OptionsManager');
	var Transitionable = require('famous/transitions/Transitionable');
	var TransitionableTransform = require('famous/transitions/TransitionableTransform');

	/**
	 * MetLightbox, using transitions, shows and hides different renderables. MetLightbox can essentially be
	 * thought of as RenderController with a stateful implementation and interface.
	 *
	 * @class MetLightbox
	 * @constructor
	 * @param {Options} [options] An object of configurable options.
	 * @param {Transform} [options.inTransform] The transform at the start of transitioning in a shown renderable.
	 * @param {Transform} [options.outTransform] The transform at the end of transitioning out a renderable.
	 * @param {Transform} [options.showTransform] The transform applied to your shown renderable in its state of equilibrium.
	 * @param {Number} [options.inOpacity] A number between one and zero that defines the state of a shown renderables opacity upon initially
	 * being transitioned in.
	 * @param {Number} [options.outOpacity] A number between one and zero that defines the state of a shown renderables opacity upon being
	 * fully transitioned out.
	 * @param {Number} [options.showOpacity] A number between one and zero that defines the state of a shown renderables opacity
	 * once succesfully transitioned in.
	 * @param {Array<Number>} [options.inOrigin] A two value array of numbers between one and zero that defines the state of a shown renderables
	 * origin upon intially being transitioned in.
	 * @param {Array<Number>} [options.outOrigin] A two value array of numbers between one and zero that defines the state of a shown renderable
	 * origin once fully hidden.
	 * @param {Array<Number>} [options.showOrigin] A two value array of numbers between one and zero that defines the state of a shown renderables
	 * origin upon succesfully being shown.
	 * @param {Array<Number>} [options.inAlign] A two value array of numbers between one and zero that defines the state of a shown renderables
	 * align upon intially being transitioned in.
	 * @param {Array<Number>} [options.outAlign] A two value array of numbers between one and zero that defines the state of a shown renderable
	 * align once fully hidden.
	 * @param {Array<Number>} [options.showAlign] A two value array of numbers between one and zero that defines the state of a shown renderables
	 * align upon succesfully being shown.
	 * @param {Transition} [options.inTransition=true] The transition in charge of showing a renderable.
	 * @param {Transition} [options.outTransition=true]  The transition in charge of removing your previous renderable when
	 * you show a new one, or hiding your current renderable.
	 * @param {Boolean} [options.overlap=false] When showing a new renderable, overlap determines if the
	 *   out transition of the old one executes concurrently with the in transition of the new one,
	 *  or synchronously beforehand.
	 */
	function MetLightbox(options) {
		this.options = Object.create(MetLightbox.DEFAULT_OPTIONS);
		this._optionsManager = new OptionsManager(this.options);

		if (options) this.setOptions(options);

		this.renderables = [];
		this.nodes = [];
		this.transforms = [];
		this.states = [];
	}

	MetLightbox.DEFAULT_OPTIONS = {
		inOpacity: 1,
		outOpacity: 1,
		showOpacity: 1,

		inOrigin: [0.5, 0.5],
		outOrigin: [0.5, 0.5],
		showOrigin: [0.5, 0.5],

		inAlign: [0.5, 0.5],
		outAlign: [0.5, 0.5],
		showAlign: [0.5, 0.5],

		inTransform: Transform.scale(1, 1, 1.00001),
		outTransform: Transform.scale(1, 1, 1.00001),
		showTransform: Transform.scale(1, 1, 1.00001),

		inTransition: {duration: 0},
		outTransition: {duration: 0},

		together: false,
	};

	/**
	 * Patches the MetLightbox instance's options with the passed-in ones.
	 *
	 * @method setOptions
	 * @param {Options} options An object of configurable options for the MetLightbox instance.
	 */
	MetLightbox.prototype.setOptions = function setOptions(options) {
		return this._optionsManager.setOptions(options);
	};

	/**
	 * Show displays the targeted renderable with a transition and an optional callback to
	 *  execute afterwards.
	 * @method show
	 * @param {Object} renderable The renderable you want to show.
	 * @param {Transition} transition Overwrites the default transition in to display the
	 * passed-in renderable.
	 * @param {function} callback Executes after transitioning in the renderable.
	 */
	MetLightbox.prototype.show = function show(renderable, transition, callback) {
		if (!renderable)
			return this.hide(null, null, callback);

		var stateItem = {
			transform: new TransitionableTransform(this.options.inTransform),
			origin: new Transitionable(this.options.inOrigin),
			align: new Transitionable(this.options.inAlign),
			opacity: new Transitionable(this.options.inOpacity)
		};

		var transform = new Modifier({
			transform: stateItem.transform,
			opacity: stateItem.opacity,
			origin: stateItem.origin,
			align: stateItem.align
		});
		var node = new RenderNode();
		node.add(transform).add(renderable);
		this.renderables.push(renderable);
		this.nodes.push(node);
		this.states.push(stateItem);
		this.transforms.push(transform);

		var _cb = callback ? Utility.after(3, callback) : undefined;

		if (!transition) transition = this.options.inTransition;
		stateItem.transform.set(this.options.showTransform, transition, _cb);
		stateItem.opacity.set(this.options.showOpacity, transition, _cb);
		stateItem.origin.set(this.options.showOrigin, transition, _cb);
		stateItem.align.set(this.options.showAlign, transition, _cb);
	};

	/**
	 * Hide hides the currently displayed renderable with an out transition.
	 * @method hide
	 * @param {Object} renderable The renderable you want to hide.
	 * @param {Transition} transition Overwrites the default transition in to hide the
	 * currently controlled renderable.
	 * @param {function} callback Executes after transitioning out the renderable.
	 */
	MetLightbox.prototype.hide = function hide(renderable, transition, callback) {
		var index = -1;
		if (!renderable) {
			if (this.renderables.length > 0) {
				index = this.renderables.length - 1;
				renderable = this.renderables[index];
			}
		}
		else {
			index = this.renderables.indexOf(renderable);
		}

		if (!renderable || index == -1) {
			if (callback) callback.call(this);
			return;
		}

		var node = this.nodes[index];
		var transform = this.transforms[index];
		var stateItem = this.states[index];

		var _cb = Utility.after(3, function () {
			this.renderables.splice(this.renderables.indexOf(renderable), 1);
			this.nodes.splice(this.nodes.indexOf(node), 1);
			this.states.splice(this.states.indexOf(stateItem), 1);
			this.transforms.splice(this.transforms.indexOf(transform), 1);
			if (callback) callback.call(this);
		}.bind(this));

		if (!transition) transition = this.options.outTransition;
		stateItem.transform.set(this.options.outTransform, transition, _cb);
		stateItem.opacity.set(this.options.outOpacity, transition, _cb);
		stateItem.origin.set(this.options.outOrigin, transition, _cb);
		stateItem.align.set(this.options.outAlign, transition, _cb);
	};

	function _fullAnimateOptions(options) {
		if (!options) options = {};
		options = {
			opacity: options.opacity || 1,
			origin: options.origin || [0.5, 0.5],
			align: options.align || [0.5, 0.5],
			transform: options.transform || Transform.scale(1, 1, 1.00001),
			visible: options.visible || true,
			zIndex: options.zIndex || 1,
		};
		return options;
	}

	// no animating
	MetLightbox.prototype.addRenderable = function (renderable, options) {
		if (!renderable) return;
		options = _fullAnimateOptions(options);
		var stateItem = {
			transform: new TransitionableTransform(options.transform),
			origin: new Transitionable(options.origin),
			align: new Transitionable(options.align),
			opacity: new Transitionable(options.opacity)
		};

		var transform = new Modifier({
			transform: stateItem.transform,
			opacity: stateItem.opacity,
			origin: stateItem.origin,
			align: stateItem.align
		});
		var node = new RenderNode();
		node.add(transform).add(renderable);
		this.renderables.push(renderable);
		this.nodes.push(node);
		this.states.push(stateItem);
		this.transforms.push(transform);
	};

	// no animating
	MetLightbox.prototype.removeRenderable = function (renderable) {
		if (!renderable) return;
		var index = this.renderables.indexOf(renderable);
		if (index == -1) return;

		this.renderables.splice(index, 1);
		this.nodes.splice(index, 1);
		this.states.splice(index, 1);
		this.transforms.splice(index, 1);
	};

	// just do animation, without add or remove renderables
	MetLightbox.prototype.animateRenderableWithFromToOptions = function (renderable, transition, fromOptions, toOptions, callback) {
		if (!renderable) return;
		var index = this.renderables.indexOf(renderable);
		if (index == -1) return;

		if (null != fromOptions) fromOptions = _fullAnimateOptions(fromOptions);
		toOptions = _fullAnimateOptions(toOptions);

		var stateItem = this.states[index];

		if (null != fromOptions) {
			stateItem.transform.set(fromOptions.transform);
			stateItem.opacity.set(fromOptions.opacity);
			stateItem.origin.set(fromOptions.origin);
			stateItem.align.set(fromOptions.align);
		}

		var _cb = callback ? Utility.after(3, callback) : undefined;

		stateItem.transform.set(toOptions.transform, transition, _cb);
		stateItem.opacity.set(toOptions.opacity, transition, _cb);
		stateItem.origin.set(toOptions.origin, transition, _cb);
		stateItem.align.set(toOptions.align, transition, _cb);
	};

	// no animating
	MetLightbox.prototype.modifyRenderableWithOptions = function (renderable, options) {
		if (!renderable) return;
		var index = this.renderables.indexOf(renderable);
		if (index == -1) return;

		options = _fullAnimateOptions(options);

		var stateItem = this.states[index];
		stateItem.transform.set(options.transform);
		stateItem.opacity.set(options.opacity);
		stateItem.origin.set(options.origin);
		stateItem.align.set(options.align);
	};

	MetLightbox.prototype.stateItem4Renderable = function (renderable) {
		if (!renderable) return null;
		var index = this.renderables.indexOf(renderable);
		if (-1 != index)
			return this.states[index];
		else
			return null;
	};

	/**
	 * Generate a render spec from the contents of this component.
	 *
	 * @private
	 * @method render
	 * @return {number} Render spec for this component
	 */
	MetLightbox.prototype.render = function render() {
		var result = [];
		for (var i = 0; i < this.nodes.length; i++) {
			result.push(this.nodes[i].render());
		}
		if (result.length > 0)
			return result;
		else
			return ".";
	};

	module.exports = MetLightbox;
});