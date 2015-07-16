/**
 * Created by archangel on 2015/7/7.
 */
define(function (require, exports, module) {
    'use strict';

    var UnitConverter = require('tools/UnitConverter');

    var DebugUtils = require('utils/DebugUtils');
    var Transform = require('famous/core/Transform');
    var TransformUtils = {};

    // ...
    TransformUtils.transformFromElement = function(me, l){
        var parent = __commonSuper4Elements(me, l);
        if(null == parent)
            return Transform.identity;

        // l to parent
        var ltf = Transform.identity;
        while(l != parent){
            var tt = __transformMapChildToParent(l);
            ltf = Transform.multiply4x4(ltf, tt);
            l = l.offsetParent;
        }
        // me to parent
        var mtf = Transform.identity;
        while(me != parent){
            var tt = __transformMapChildToParent(me);
            mtf = Transform.multiply4x4(mtf, tt);
            me = me.offsetParent;
        }

        return Transform.multiply4x4(ltf, Transform.inverse(mtf));
    }

    TransformUtils.transformToElement = function(me, l){
        var parent = __commonSuper4Elements(me, l);
        if(null == parent)
            return Transform.identity;

        // l to parent
        var ltf = Transform.identity;
        while(l != parent){
            var tt = __transformMapChildToParent(l);
            ltf = Transform.multiply4x4(ltf, tt);
            l = l.offsetParent;
        }
        // me to parent
        var mtf = Transform.identity;
        while(me != parent){
            var tt = __transformMapChildToParent(me);
            mtf = Transform.multiply4x4(mtf, tt);
            me = me.offsetParent;
        }

        return Transform.multiply4x4(mtf, Transform.inverse(ltf));
    }

    // find common offset parent element for two html elements a && b
    function __transformMapChildToParent(child){
        var m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        var anchor = TransformUtils.elementAnchorLocation(child);

        {
            var position = TransformUtils.elementPosition(child);
            m = Transform.moveThen([-anchor[0], -anchor[1], 0], m);
            m = Transform.multiply4x4(m, TransformUtils.elementTransform(child));
            m = Transform.thenMove(m, [position[0], position[1], 0]);
        }

        // maybe don't need following : TODO
        var parent = child.offsetParent;
        if(parent){
            m = Transform.thenMove(m, [-anchor[0], -anchor[1], 0]);
            m = Transform.multiply4x4(m, Transform.identity);
            m = Transform.thenMove(m, [anchor[0], anchor[1], 0]);
        }
        return m;
    }

    // find common offset super element for two html elements a && b
    function __commonSuper4Elements(a, b){
        var a_array = [];
        while(null != a){
            a_array.push(a);
            a = a.offsetParent;
        }
        while(null != b){
            if(-1 != a_array.indexOf(b))
                return b;
            b = b.offsetParent;
        }
        return null;
    }

    // size
    TransformUtils.elementSize = function(element){
        return [element.clientWidth, element.clientHeight];
    }

    // bounds
    TransformUtils.elementBounds = function(element){
        return [0, 0, element.clientWidth, element.clientHeight];
    }

    // position : center point position
    TransformUtils.elementPosition = function(element){
        return [element.offsetLeft + element.offsetWidth/2, element.offsetTop + element.offsetHeight/2];
    }

    // anchor location : looking in element's local system
    // so far, always say anchor is (0.5, 0.5), calc child's center in bounds
    TransformUtils.elementAnchorLocation = function(element){
        return [element.clientWidth/2, element.clientHeight/2];
    }

    // transform : get transform matrix
    TransformUtils.elementTransform = function(element){
        var st = window.getComputedStyle(element, null);
        var tr = st.getPropertyValue("-webkit-transform") ||
            st.getPropertyValue("-moz-transform") ||
            st.getPropertyValue("-ms-transform") ||
            st.getPropertyValue("-o-transform") ||
            st.getPropertyValue("transform") || null;

        var is3d = false;
        if(null == tr)
            return Transform.identity;
        else if(-1 != tr.toLowerCase().indexOf("matrix3d"))
            is3d = true;
        else if(-1 != tr.toLowerCase().indexOf("matrix"))
            is3d = false;
        else
            return Transform.identity;

        // tr is matrix(...) or matrix3d(...)
        var f = tr.indexOf("(");
        var t = tr.lastIndexOf(")")
        tr = tr.substring(f + 1, t);
        var nums = tr.split(",");

        var m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        if(is3d){
            for(var i = 0; i < 16; i++){
                m[i] = Number(nums[i]);
            }
        }
        else{
            // a
            m[0] = Number(nums[0]);
            // b
            m[1] = Number(nums[1]);
            // c
            m[4] = Number(nums[2]);
            // d
            m[5] = Number(nums[3]);
            // e
            m[12] = Number(nums[4]);
            // f
            m[13] = Number(nums[5]);
        }
        return m;
    }

    TransformUtils.pointApplyTransform = function(point, m){
        if (!point[2]) point[2] = 0;
        var px = [
            point[0], point[1], point[2], 1,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
        ];
        px = Transform.multiply4x4(m, px);
        return [px[0], px[1], px[2]];
    }

    module.exports = TransformUtils;
});