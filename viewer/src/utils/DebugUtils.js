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

    var _brower_prefix = null;
    DebugUtils.browserPrefixes = function() {
        if(null != _brower_prefix)
            return _brower_prefix;

        var styles = window.getComputedStyle(document.documentElement, '');
        var pre = Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/);
        pre = pre || (styles.OLink === '' && ['', 'o']);
        pre = pre[1];
        var dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
        return _brower_prefix = {
            dom: dom,
            lowercase: pre,
            css: '-' + pre + '-',
            js: pre[0].toUpperCase() + pre.substr(1)
        };
    }

    module.exports = DebugUtils;
});