define(function(require, exports, module) {
    var Surface = require('famous/core/Surface');
    var EventHandler = require('famous/core/EventHandler');
    var RenderController = require('famous/views/RenderController');

    /**
     * A view for transitioning between two surfaces based
     *  on a 'on' and 'off' state
     *
     * @class TabBar
     * @extends View
     * @constructor
     *
     * @param {object} options overrides of default options
     */
    function MetButton(options) {
        this.options = {
            content: ['', ''],
            offClasses: ['off'],
            onClasses: ['on'],
            size: undefined,
            outTransition: {curve: 'easeInOut', duration: 300},
            inTransition: {curve: 'easeInOut', duration: 300},
            toggleMode: MetButton.TOGGLE,
            crossfade: true
        };

        this._eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this._eventOutput);


        this.arbiter = new RenderController({
            overlap : this.options.crossfade
        });

        if (options) this.setOptions(options);
    }

    MetButton.OFF = 0;
    MetButton.ON = 1;
    MetButton.TOGGLE = 2;

    MetButton.prototype.setStataViews = function (views) {
        this.offView = views[1];
        this.offView.on('click', function() {
            if (this.options.toggleMode !== MetButton.OFF) this.select();
        }.bind(this));
        //this.offView.pipe(this._eventOutput);

        this.onView = views[0];
        this.onView.on('click', function() {
            if (this.options.toggleMode !== MetButton.ON) this.deselect();
        }.bind(this));
        this.onView.pipe(this._eventOutput);
    }

    /**
     * Transition towards the 'on' state and dispatch an event to
     *  listeners to announce it was selected. Accepts an optional
     *  argument, `suppressEvent`, which, if truthy, prevents the
     *  event from being dispatched.
     *
     * @method select
     * @param [suppressEvent] {Boolean} When truthy, prevents the
     *   widget from emitting the 'select' event.
     */
    MetButton.prototype.select = function select(suppressEvent) {
        this.selected = true;
        this.arbiter.show(this.onView, this.options.inTransition);
//        this.arbiter.setMode(MetButton.ON, this.options.inTransition);
        if (!suppressEvent) {
            this._eventOutput.emit('select');
        }
    };

    /**
     * Transition towards the 'off' state and dispatch an event to
     *  listeners to announce it was deselected. Accepts an optional
     *  argument, `suppressEvent`, which, if truthy, prevents the
     *  event from being dispatched.
     *
     * @method deselect
     * @param [suppressEvent] {Boolean} When truthy, prevents the
     *   widget from emitting the 'deselect' event.
     */
    MetButton.prototype.deselect = function deselect(suppressEvent) {
        this.selected = false;
        this.arbiter.show(this.offView, this.options.outTransition);
        if (!suppressEvent) {
            this._eventOutput.emit('deselect');
        }
    };

    /**
     * Return the state of the button
     *
     * @method isSelected
     *
     * @return {boolean} selected state
     */
    MetButton.prototype.isSelected = function isSelected() {
        return this.selected;
    };

    /**
     * Override the current options
     *
     * @method setOptions
     *
     * @param {object} options JSON
     */
    MetButton.prototype.setOptions = function setOptions(options) {
        if (options.content !== undefined) {
            if (!(options.content instanceof Array))
                options.content = [options.content, options.content];
        }
        if (options.offClasses) {
            this.options.offClasses = options.offClasses;
        }
        if (options.onClasses) {
            this.options.onClasses = options.onClasses;
        }
        if (options.size !== undefined) {
            this.options.size = options.size;
        }
        if (options.toggleMode !== undefined) this.options.toggleMode = options.toggleMode;
        if (options.outTransition !== undefined) this.options.outTransition = options.outTransition;
        if (options.inTransition !== undefined) this.options.inTransition = options.inTransition;
        if (options.crossfade !== undefined) {
            this.options.crossfade = options.crossfade;
            this.arbiter.setOptions({overlap: this.options.crossfade});
        }
    };

    /**
     * Return the size defined in the options object
     *
     * @method getSize
     *
     * @return {array} two element array [height, width]
     */
    MetButton.prototype.getSize = function getSize() {
        return this.options.size;
    };

    /**
     * Generate a render spec from the contents of this component.
     *
     * @private
     * @method render
     * @return {number} Render spec for this component
     */
    MetButton.prototype.render = function render() {
        return this.arbiter.render();
    };

    module.exports = MetButton;
});
