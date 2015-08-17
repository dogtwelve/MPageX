/**
 * Created by sodemon on 2015/7/20.
 */
define(function(require, exports, module) {
    var EventHandler = require('famous/core/EventHandler');

    /**
     * EventDispatcher regulates the broadcasting of events based on
     *  a specified processer function of standard event type: function(type, data).
     *
     * @class EventDispatcher
     * @constructor
     *
     * @param {function} processer function to determine whether or not
     *    events are emitted.
     */
    function EventDispatcher(processer) {
        EventHandler.call(this);
        this._processer = processer;
    }
    EventDispatcher.prototype = Object.create(EventHandler.prototype);
    EventDispatcher.prototype.constructor = EventDispatcher;

    /**
     * If event no be processed, trigger an event, sending to all downstream handlers
     *   listening for provided 'type' key.
     *
     * @method emit
     *
     * @param {string} type event type key (for example, 'click')
     * @param {Object} data event data
     * @return {EventHandler} this
     */
    EventDispatcher.prototype.emit = function emit(type, data) {
        if (!this._processer(type, data))
            return EventHandler.prototype.emit.apply(this, arguments);
    };

    /**
     * An alias of emit. Trigger determines whether to send
     *  events based on the return value of it's processer function
     *  when passed the event type and associated data.
     *
     * @method trigger
     * @param {string} type name of the event
     * @param {object} data associated data
     */
    EventDispatcher.prototype.trigger = EventDispatcher.prototype.emit;

    module.exports = EventDispatcher;
});