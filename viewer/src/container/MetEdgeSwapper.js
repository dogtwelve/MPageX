define(function(require, exports, module) {
    var CachedMap = require('famous/transitions/CachedMap');
    var Entity = require('famous/core/Entity');
    var EventHandler = require('famous/core/EventHandler');
    var Transform = require('famous/core/Transform');
    var RenderController = require('famous/views/RenderController');

    /**
     * Container which handles swapping renderables from the edge of its parent context.
     * @class MetEdgeSwapper
     * @constructor
     * @param {Options} [options] An object of configurable options.
     *   Takes the same options as RenderController.
     * @uses RenderController
     */
    function MetEdgeSwapper(options) {
        this._currentTarget = null;
        this._size = [undefined, undefined];

        this._controller = new RenderController(options);
        this._controller.inTransformFrom(CachedMap.create(_transformMap.bind(this, 0.0001)));
        this._controller.outTransformFrom(CachedMap.create(_transformMap.bind(this, -0.0001)));

        this._eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);

        this._entityId = Entity.register(this);
        if (options) this.setOptions(options);
    }

    function _transformMap(zMax, progress) {
        return Transform.translate(this._size[0] * (1 - progress), 0, zMax * (1 - progress));
    }

    /**
     * Displays the passed-in content with the MetEdgeSwapper instance's default transition.
     *
     * @method show
     * @param {Object} content The renderable you want to display.
     */
    MetEdgeSwapper.prototype.show = function show(content) {
        // stop sending input to old target
        if (this._currentTarget) this._eventInput.unpipe(this._currentTarget);

        this._currentTarget = content;

        // start sending input to new target
        if (this._currentTarget && this._currentTarget.trigger) this._eventInput.pipe(this._currentTarget);

        this._controller.show.apply(this._controller, arguments);
    };

    /**
     * Patches the MetEdgeSwapper instance's options with the passed-in ones.
     *
     * @method setOptions
     * @param {Options} options An object of configurable options for the MetEdgeSwapper instance.
     */
    MetEdgeSwapper.prototype.setOptions = function setOptions(options) {
        this._controller.setOptions(options);
    };

    /**
     * Generate a render spec from the contents of this component.
     *
     * @private
     * @method render
     * @return {number} Render spec for this component
     */
    MetEdgeSwapper.prototype.render = function render() {
        return this._entityId;
    };

    /**
     * Apply changes from this component to the corresponding document element.
     * This includes changes to classes, styles, size, content, opacity, origin,
     * and matrix transforms.
     *
     * @private
     * @method commit
     * @param {Context} context commit context
     */
    MetEdgeSwapper.prototype.commit = function commit(context) {
        this._size[0] = context.size[0];
        this._size[1] = context.size[1];

        return {
            transform: context.transform,
            opacity: context.opacity,
            origin: context.origin,
            size: context.size,
            target: this._controller.render()
        };
    };

    module.exports = MetEdgeSwapper;
});
