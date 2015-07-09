/**
 * Created by archangel on 2015/7/7.
 */
define(function (require, exports, module) {
    'use strict';

    var UnitConverter = require('tools/UnitConverter');

    var DebugUtils = require('utils/DebugUtils');
    var TextUtils = {};

    // MetTextNodeHorizontalAlignmentLeft = 0,		// Visually left aligned
    // MetTextNodeHorizontalAlignmentCenter = 1,	// Visually centered
    // MetTextNodeHorizontalAlignmentRight = 2,	// Visually right aligned
    // MetTextNodeHorizontalAlignmentFull = 3	// Fully-justified. The last line in a paragraph is natural-aligned.
    var _textAlignments = ["left", "center", "right", "justify"];

    // font styles
    var MetTextFontStyleRegular = 0;
    var MetTextFontStyleBold = 1;
    var MetTextFontStyleItalic = 2;
    var MetTextFontStyleUnderline = 4;
    var MetTextFontStyleStrikeout = 8;

    // ...
    TextUtils.parseBlocks2Html = function(blocks) {
        var html = "";
        var blocks_count = blocks.length;
        if(!(blocks_count > 0))
            return html;

        // sort by block.loc ascent
        blocks.sort(function(obj1, obj2){
            if(obj1.loc > obj2.loc)
                return 1;
            else if(obj1.loc < obj2.loc)
                return -1;
        });

        // get text for this node
        var nodeText = (blocks_count > 0) ? blocks[0].text : "";
        DebugUtils.log("->[" + nodeText + "]");
        // trace paragraphs
        var re = /\r?\n/g;
        var dic = null;
        var s_from = 0, s_to = 0;
        var b_i = 0;
        do{
            html += "<p";
            // paragraph styles
            var paragraph_css = null;

            dic = re.exec(nodeText);
            s_to = (null != dic) ? dic.index : (nodeText.length - 1);

            // trace all blocks in this paragraph
            for(b_i; b_i < blocks_count;){
                var block = blocks[b_i];
                if (block.loc + block.length < s_from)
                    continue;
                if (block.loc >= s_to)
                    break;
                else
                    b_i++;

                // calc [block.loc, block.loc + block.length] ^ [s_from, s_to]
                var b_from = Math.max(block.loc, s_from)
                var b_to = Math.min(block.loc + block.length, s_to)

                // ignore empty string
                if(b_from == b_to)
                    continue;

                // paragraph styles
                if(null == paragraph_css) {
                    paragraph_css = TextUtils.sprintf(" style='width:100%%; margin:%dpx %dpx %dpx %dpx;'", block.frontSpacing, block.tailIndent, block.backSpacing, block.headIndent);
                    html += paragraph_css + ">";
                }

                // show characters in range[b_from, b_to]
                var css = "";
                css += "color: " + UnitConverter.decimalToHexColorString(block.fontColor) + ";";
                css += "text-align: " + _textAlignments[block.horizontalAlignment] + ";";
                if(0 != (block.fontStyle & (MetTextFontStyleUnderline | MetTextFontStyleStrikeout))){
                    css += "text-decoration:";
                    if (0 != (block.fontStyle & MetTextFontStyleUnderline))
                        css += " underline";
                    if (0 != (block.fontStyle & MetTextFontStyleStrikeout))
                        css += " line-through";
                    css += ";";
                }

                // {font:font-style font-variant font-weight font-size font-family}
                var font_style = (0 != block.fontStyle & MetTextFontStyleItalic) ? "italic" : "normal";
                var font_variant = "";
                var font_weight = (0 != block.fontStyle & MetTextFontStyleBold) ? "bold" : "normal";
                var font_size = block.fontSize + "px";
                var font_family = block.fontName;
                font_family = "STHeitiSC-Light";
                css += "font: " + font_style + " " + font_variant + " " + font_weight + " " + font_size + " " + font_family + ";"

                var btext = nodeText.slice(b_from, b_to);

                DebugUtils.log("s_from " + s_from + " s_to " + s_to);
                DebugUtils.log("k_from " + block.loc + " k_to " + (block.loc + block.length));
                DebugUtils.log("b_from " + b_from + " b_to " + b_to);
                DebugUtils.log("[" + btext + "]");

                btext = TextUtils.htmlEncode(btext)
                html += "<span style='" + css + "'>";
                html += btext;
                html += "</span>";
            }
            if(null == paragraph_css)
                html += " style='width:100%; margin:0px %dpx %dpx %dpx;'>";
            html += "</p>";

            // for next paragraph
            s_from = s_to + ((null != dic) ? dic[0].length : 0);
        }
        while(dic != null);

        return html;
    }

//"backColor" : 0,
//    "class" : "TextBlockDescriptor",,
//    "verticalAlignment" : 0,
//    "baselineStyle" : 0,
//    "bias" : 1,
//    "baselineShift" : 0,
//    "lineSpacing" : 0,
//    "hrate" : 1,
//    "vrate" : 1,
//    "paragraphIndent" : 0,
//    "tracking" : 0,
//    "bSetParagraph" : 1,

    // ...
    TextUtils.htmlEncode = function(str){
        var s = "";
        if(str.length == 0) return "";
        s = str.replace(/&/g, "&gt;");
        s = s.replace(/</g, "&lt;");
        s = s.replace(/>/g, "&gt;");
        s = s.replace(/    /g, "&nbsp;");
        s = s.replace(/\'/g, "'");
        s = s.replace(/\"/g, "&quot;");
        s = s.replace(/\n/g, "<br>");
        return s;
    }

    // ...
    TextUtils.htmlDecode = function(str){
        var s = "";
        if(str.length == 0) return "";
        s = str.replace(/&gt;/g, "&");
        s = s.replace(/&lt;/g, "<");
        s = s.replace(/&gt;/g, ">");
        s = s.replace(/&nbsp;/g, "    ");
        s = s.replace(/'/g, "\'");
        s = s.replace(/&quot;/g, "\"");
        s = s.replace(/<br>/g, "\n");
        return s;
    }

    // ... private use for sprintf
    function str_repeat(i, m) {
        for (var o = []; m > 0; o[--m] = i);
        return o.join('');
    }

    // ...
    TextUtils.sprintf = function() {
        var i = 0, a, f = arguments[i++], o = [], m, p, c, x, s = '';
        while (f) {
            if (m = /^[^\x25]+/.exec(f)) {
                o.push(m[0]);
            }
            else if (m = /^\x25{2}/.exec(f)) {
                o.push('%');
            }
            else if (m = /^\x25(?:(\d+)\$)?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(f)) {
                if (((a = arguments[m[1] || i++]) == null) || (a == undefined)) {
                    throw('Too few arguments.');
                }
                if (/[^s]/.test(m[7]) && (typeof(a) != 'number')) {
                    throw('Expecting number but found ' + typeof(a));
                }
                switch (m[7]) {
                    case 'b': a = a.toString(2); break;
                    case 'c': a = String.fromCharCode(a); break;
                    case 'd': a = parseInt(a); break;
                    case 'e': a = m[6] ? a.toExponential(m[6]) : a.toExponential(); break;
                    case 'f': a = m[6] ? parseFloat(a).toFixed(m[6]) : parseFloat(a); break;
                    case 'o': a = a.toString(8); break;
                    case 's': a = ((a = String(a)) && m[6] ? a.substring(0, m[6]) : a); break;
                    case 'u': a = Math.abs(a); break;
                    case 'x': a = a.toString(16); break;
                    case 'X': a = a.toString(16).toUpperCase(); break;
                }
                a = (/[def]/.test(m[7]) && m[2] && a >= 0 ? '+'+ a : a);
                c = m[3] ? m[3] == '0' ? '0' : m[3].charAt(1) : ' ';
                x = m[5] - String(a).length - s.length;
                p = m[5] ? str_repeat(c, x) : '';
                o.push(s + (m[4] ? a + p : p + a));
            }
            else {
                throw('Huh ?!');
            }
            f = f.substring(m[0].length);
        }
        return o.join('');
    }

    module.exports = TextUtils;
});