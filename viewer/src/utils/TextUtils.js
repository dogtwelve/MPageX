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
    var _textAlignments = ["left", "center", "right", "justify", "justify"];

    // font styles
    var MetTextFontStyleRegular = 0;
    var MetTextFontStyleBold = 1;
    var MetTextFontStyleItalic = 2;
    var MetTextFontStyleUnderline = 4;
    var MetTextFontStyleStrikeout = 8;

    // BaselineStyle
    var MetTextBaselineDefault = 0;
    var MetTextBaselineSuperscripting = 1;
    var MetTextBaselineSubscripting = 2;

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
        var nodeText = blocks[0].text;

        // trace paragraphs
        var re = /\r?\n/g;
        var dic = null;
        // -- paragragh from, to
        var p_from = 0, p_to = 0;
        // -- text from, to
        var t_from = 0, t_to = 0;
        var b_i = 0;
        do{
            html += "<p";
            // paragraph styles
            var paragraph_css = null;

            dic = re.exec(nodeText);
            p_to = (null != dic) ? dic.index : nodeText.length;

            // trace all blocks in this paragraph
            for(b_i; b_i < blocks_count;){
				if(t_to >= p_to)
					break;
                var block = blocks[b_i];
                if(block.loc >= p_to)
                    break;
                else if(block.loc + block.length <= p_from){
                    b_i++;
                    continue;
                }

                // calc text [from, to] = [block.loc, block.loc + block.length] ^ [p_from, p_to]
				t_from = Math.max(block.loc, p_from)
				t_to = Math.min(block.loc + block.length, p_to)
                // if current block is finished, move b_i next
                if(t_to >= block.loc + block.length)
                    b_i++;

                // ignore empty string
                if(t_from == t_to)
                    continue;

                // paragraph styles
                // fields: lineSpacing, fontSpacing, tailIndent, backSpacing, headIndent
                if(null == paragraph_css) {
                    var paragraph_line_spacing = block.lineSpacing || 0;

                    paragraph_css = " class='text_p' style='";
                    paragraph_css += TextUtils.sprintf("margin:%dpx %dpx %dpx %dpx;", block.frontSpacing - paragraph_line_spacing/2, block.tailIndent, block.backSpacing + paragraph_line_spacing/2, block.headIndent);
                    paragraph_css += TextUtils.sprintf("text-indent: %dpx;", block.paragraphIndent);
                    paragraph_css += "'";
                    html += paragraph_css + ">";
                }

                // show characters in range[t_from, t_to]
                // fields: fontColor, horizontalAlignment, baselineShift, fontStyle, tracking, backColor
                var css = "";
                css += TextUtils.sprintf("color: %s;", UnitConverter.rgba2ColorString(block.fontColor));
                css += TextUtils.sprintf("text-align: %s;", _textAlignments[block.horizontalAlignment]);
                if(0 != block.baselineShift)
                    css += TextUtils.sprintf("vertical-align: %fpx;", block.baselineShift);
                if(0 != (block.fontStyle & (MetTextFontStyleUnderline | MetTextFontStyleStrikeout))){
                    // text-decoration
                    css += "text-decoration:";
                    if (0 != (block.fontStyle & MetTextFontStyleUnderline))
                        css += " underline";
                    if (0 != (block.fontStyle & MetTextFontStyleStrikeout))
                        css += " line-through";
                    css += ";";
                    // spacings
                    if(0 != block.tracking)
                        css += TextUtils.sprintf("letter-spacing: %dpx", block.tracking);
                }
                if(0 != block.backColor)
                    css += TextUtils.sprintf("background-color: %s;", UnitConverter.rgba2ColorString(block.backColor));

                // {font:font-style font-variant font-weight font-size font-family}
                var font_style = (0 != block.fontStyle & MetTextFontStyleItalic) ? "italic" : "normal";
                var font_variant = "";
                var font_weight = (0 != block.fontStyle & MetTextFontStyleBold) ? "bold" : "normal";
                var font_size = block.fontSize + "px";
                var font_family = block.fontName;
                css += "font: " + font_style + " " + font_variant + " " + font_weight + " " + font_size + " " + font_family + ";"
                css += TextUtils.sprintf("line-height: %dpx;", block.lineSpacing + block.fontSize);

                // text block shadow
                var shadow = block.nodeShadow;
                if(null != shadow){
                    var shadowX = shadow.shadowOffset * Math.cos(shadow.shadowAngle);
                    var shadowY = shadow.shadowOffset * Math.sin(shadow.shadowAngle);
                    var shadowBlur = shadow.shadowWidth;
                    if(!(shadowX === 0 && shadowY === 0 && shadowBlur == 0)){
                        var shadowColor = UnitConverter.rgba2ColorString(shadow.shadowColor);
                        css += TextUtils.sprintf(" text-shadow: %fpx %fpx %fpx %s;", shadowX, shadowY, shadowBlur, shadowColor)
                    }
                }

                var btext = nodeText.slice(t_from, t_to);

                //DebugUtils.log("p_from " + p_from + " p_to " + p_to);
                //DebugUtils.log("k_from " + block.loc + " k_to " + (block.loc + block.length));
                //DebugUtils.log("t_from " + t_from + " t_to " + t_to);
                //DebugUtils.log("[" + btext + "]");

                // sup or sub begin tag
                // fields: baselineStyle
                if(MetTextBaselineSuperscripting == block.baselineStyle)
                    html += "<sup>"
                else if(MetTextBaselineSubscripting == block.baselineStyle)
                    html += "<sub>";

                btext = TextUtils.htmlEncode(btext)
                html += "<span style='" + css + "'>";
                html += btext;
                html += "</span>";

                // sup or sub end tag
                // fields: baselineStyle
                if(MetTextBaselineSuperscripting == block.baselineStyle)
                    html += "</sup>"
                else if(MetTextBaselineSubscripting == block.baselineStyle)
                    html += "</sub>";
            }
            if(null == paragraph_css)
                html += " style='width:100%; margin:0px %dpx %dpx %dpx;'>";
            html += "</p>";

            // for next paragraph
            p_from = p_to + ((null != dic) ? dic[0].length : 0);
        }
        while(dic != null);

        return html;
    }

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
                    a = 0;
                    console.log('Too few arguments. make do with 0 here.');
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