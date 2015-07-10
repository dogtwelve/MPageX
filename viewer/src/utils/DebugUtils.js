/**
 * Created by sodemon on 2015/5/21.
 */
define(function (require, exports, module) {
    'use strict';
    var DebugUtils = {};
    DebugUtils.log = function(logText) {
        console.log(logText);
    }
    module.exports = DebugUtils;
});