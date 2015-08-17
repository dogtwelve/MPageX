/**
 * Created by Gerry on 2015/8/13.
 */
define(function (require, exports, module) {
    var EventHandler = require('famous/core/EventHandler');
    var MetEventHandler = {
        handlers:{},
        addEventHandler:function(eventName,callback){
            this.handlers[eventName] = new EventHandler();
            if(callback){
                this.handlers[eventName].on(eventName,callback);
            }
        },
        addPipe:function(eventHandlerA,eventHandlerB){
            //事件A对事件B广播消息
            this.handlers[eventHandlerA].pipe(this.handlers[eventHandlerB]);
        },
        getEventHandler:function(eventName){
            return this.handlers[eventName];
        }
    }

    module.exports = MetEventHandler;
})
