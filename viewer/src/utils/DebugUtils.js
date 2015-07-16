/**
 * Created by sodemon on 2015/5/21.
 */
define(function (require, exports, module) {
    'use strict';

    var DebugUtils = {};
    DebugUtils.log = function(){
        for(var i in arguments){
            var v = arguments[i];
            console.log(v);
        }
    }
    module.exports = DebugUtils;
});