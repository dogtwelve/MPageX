// Gestures
define(function(require, exports, module) {
    'use strict';

    var Engine = require("famous/core/Engine");
    var Timer = require("famous/utilities/Timer");
    var TouchSync = require("famous/inputs/TouchSync");
    var MouseSync = require("famous/inputs/MouseSync");
    var GenericSync = require("famous/inputs/GenericSync");
    var TwoFingerSync = require('famous/inputs/TwoFingerSync');
    var OptionsManager = require('famous/core/OptionsManager');

    _init.call(this);

    //
    //
    //
    function _init()
    {
        GenericSync.register({
            //MouseSync: MouseSync,
            TouchSync: TouchSync
        });

        module.exports.longPressRecognizer = longPressRecognizer;
        module.exports.tapRecognizer = tapRecognizer;
        module.exports.pinchRecognizer = pinchRecognizer;
        module.exports.touchClick = touchClick;
    }

    //
    //
    //
    function longPressRecognizer(element, callback, options)
    {
        var boundary_exceeded;
        var delta_vector;
        var timeout_fn;
        var sync;

        if (options === undefined) options = {};
        if (options.minimum_press_duration === undefined) options.minimum_press_duration = 800;

        sync = new GenericSync(["TouchSync"]);
        element.pipe(sync);

        sync.on("start", function(data)
        {
            delta_vector = [0, 0];
            boundary_exceeded = false;
            timeout_fn = Timer.setTimeout(function()
            {
                callback(data);
            }, options.minimum_press_duration);
        });

        sync.on("update", function(data)
        {
            delta_vector[0] += data.delta[0];
            delta_vector[1] += data.delta[1];
            if (!_deltaWithinBounds(options.allowable_movement, delta_vector))
            {
                boundary_exceeded = true;
                _removeListener(timeout_fn);
            }
        });

        sync.on("end", function(data)
        {
            _removeListener(timeout_fn);
        });
    }

    //
    //
    //
    function tapRecognizer(element, callback, options)
    {
        var delta_vector;
        var boundary_exceeded;
        var window_open;
        var timeout_fn;
        var sync;

        if (options === undefined) options = {};
        if (options.maximum_press_duration === undefined) options.maximum_press_duration = 150;
        if (options.allowable_movement === undefined) options.allowable_movement = 5;

        sync = new GenericSync(["TouchSync"]);

        element.pipe(sync);

        sync.on("start", function(data)
        {
            delta_vector = [0, 0];
            boundary_exceeded = false;
            window_open = true;
            timeout_fn = Timer.setTimeout(function()
            {
                window_open = false;
            }, options.maximum_press_duration);
        });

        sync.on("update", function(data)
        {
            delta_vector[0] += data.delta[0];
            delta_vector[1] += data.delta[1];
            if (!_deltaWithinBounds(options.allowable_movement, delta_vector))
            {
                boundary_exceeded = true;
            }
        });

        sync.on("end", function(data)
        {
            if (window_open && !boundary_exceeded)
            {
                callback(data);
            }
        });
    }

    //
    //
    //
    function pinchRecognizer(element, options)
    {
        //console.log("pinchRecognizer");
        var sync = new _PinchSync();

        element.pipe(sync);

        sync.on("start", function(data) {
            //console.log("start");
            _mustReturnFunction(options.touchesBegan)(data);
        });

        sync.on("update", function(data) {
            //console.log("update");
            _mustReturnFunction(options.touchesMoved)(data);
        });

        sync.on("end", function(data) {
            //console.log("end");
            _mustReturnFunction(options.touchesEnded)(data);
        });
    }

    //
    //
    //
    function touchClick(element, inCallback, outCallback, clickCallback, options)
    {
        if (options === undefined) options = {};
        if (options.allowable_movement === undefined) options.allowable_x_offset = 10;
        if (options.allowable_movement === undefined) options.allowable_y_offset = 10;

        var boundary_exceeded = false;
        var sync = new GenericSync(["TouchSync"]);
        var boundary = {};

        element.pipe(sync);

        sync.on("start", function(data)
        {
            var bounding = element._currentTarget.getBoundingClientRect();

            boundary.x = [
                bounding.left - options.allowable_x_offset,
                bounding.left + bounding.width + options.allowable_x_offset
            ];

            boundary.y = [
                bounding.top - options.allowable_y_offset,
                bounding.top + bounding.height + options.allowable_y_offset
            ];

            inCallback(data);
        });

        sync.on("update", function(data)
        {
            boundary_exceeded = data.clientX > boundary.x[0] && data.clientX < boundary.x[1]
                ? data.clientY > boundary.y[0] && data.clientY < boundary.y[1]
                : true;

            if (boundary_exceeded)
            {
                outCallback(data);
            }
            else
            {
                inCallback(data);
            }
        });

        sync.on("end", function()
        {
            outCallback();
            if(!boundary_exceeded)
            {
                clickCallback();
            }
        });
    }

    //
    //
    //
    function _removeListener(fn)
    {
        Engine.removeListener("prerender", fn);
    }

    //
    //
    //
    function _mustReturnFunction(f)
    {
        return (typeof f === "function") ? f : function(){};
    }

    //
    // will return true if delta vector's magnitude
    // exceeds boundary radius, or if radius is undefined
    //
    function _deltaWithinBounds(radius, delta)
    {
        return radius === undefined
            ? true
            : radius > Math.sqrt(Math.pow(delta[0], 2) + Math.pow(delta[1], 2));
    }



    // Modified PinchSync.js from famo.us

    /**
     * Handles piped in two-finger touch events to change position via pinching / expanding.
     *   Emits 'start', 'update' and 'end' events with
     *   position, velocity, touch ids, and distance between fingers.
     *
     * @class _PinchSync
     * @extends TwoFingerSync
     * @constructor
     * @param {Object} options default options overrides
     * @param {Number} [options.scale] scale velocity by this factor
     */
    function _PinchSync(options)
    {
        TwoFingerSync.call(this);

        this.options = Object.create(_PinchSync.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);
        if (options) this.setOptions(options);

        this._displacement = 0;
        this._previousDistance = 0;
    }

    _PinchSync.prototype = Object.create(TwoFingerSync.prototype);
    _PinchSync.prototype.constructor = _PinchSync;

    _PinchSync.DEFAULT_OPTIONS = {
        scale: 1
    };

    _PinchSync.prototype._startUpdate = function _startUpdate(event)
    {
        var center = TwoFingerSync.calculateCenter(this.posA, this.posB);

        this._previousDistance = TwoFingerSync.calculateDistance(this.posA, this.posB);
        this._displacement = 0;

        this._eventOutput.emit('start', {
            count: event.touches.length,
            touches: [this.touchAId, this.touchBId],
            distance: this._dist,
            pos_a: this.posA,
            pos_b: this.posB,
            angle: this._last_angle,
            center: center
        });
    };

    _PinchSync.prototype._moveUpdate = function _moveUpdate(diffTime)
    {
        var currDist = TwoFingerSync.calculateDistance(this.posA, this.posB);
        var center = TwoFingerSync.calculateCenter(this.posA, this.posB);
        var scale = this.options.scale;
        var delta = scale * (currDist - this._previousDistance);
        var velocity = delta / diffTime;
        var angle = _angle(center, this.posA);

        this._previousDistance = currDist;
        this._displacement += delta;
        this._last_angle = angle;

        this._eventOutput.emit('update', {
            delta: delta,
            velocity: velocity,
            distance: currDist,
            displacement: this._displacement,
            pos_a: this.posA,
            pos_b: this.posB,
            angle: _angle.call(this, center, this.posA),
            center: center,
            touches: [this.touchAId, this.touchBId]
        });
    };

    function _angle(center, point)
    {
        var radius = _distance(center, point);
        if (radius == 0)
        {
            return 0;
        }
        return (point[1] > center[1])
            ? Math.acos((point[0] - center[0]) / radius)
            : Math.PI + Math.acos(-(point[0] - center[0]) / radius);
    }

    function _distance(a, b)
    {
        return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
    }

    /**
     * Return entire options dictionary, including defaults.
     *
     * @method getOptions
     * @return {Object} configuration options
     */
    _PinchSync.prototype.getOptions = function getOptions()
    {
        return this.options;
    };

    /**
     * Set internal options, overriding any default options
     *
     * @method setOptions
     *
     * @param {Object} [options] overrides of default options
     * @param {Number} [options.scale] scale velocity by this factor
     */
    _PinchSync.prototype.setOptions = function setOptions(options)
    {
        return this._optionsManager.setOptions(options);
    };
});