define(function(require, exports, module) {
    'use strict';
    var MetNodeView   = require('views/MetNodeView');
    var BgImageSurface   = require('surfaces/BgImageSurface');
    var UnitConverter = require('tools/UnitConverter');
    var Surface       = require('famous/core/Surface');
    var ImageSurface  = require('famous/surfaces/ImageSurface');
    var VideoSurface = require("famous/surfaces/VideoSurface");
    var CanvasSurface  = require('famous/surfaces/CanvasSurface');
    var UnitConverter      = require('tools/UnitConverter');
    var ContainerSurface    = require("famous/surfaces/ContainerSurface");
    var DebugUtils = require('utils/DebugUtils');
    var TextUtils = require('utils/TextUtils');

    function MetNodeFactory() {
          // Container to store created actors by name.
          this.metNodesFromFactory = {};
    }

    MetNodeFactory.prototype.makeMetNode = function(nodeDescription, containerSize, zPosition) {

        if (nodeDescription.zPosition && nodeDescription.properties) {
            nodeDescription.properties.zPosition = nodeDescription.zPosition;
        }

        var posX = nodeDescription.positionX;
        var posY = nodeDescription.positionY;
        var type = nodeDescription.class;
        var name = nodeDescription.name;
        var metNodeId = nodeDescription.id_;
        var id = nodeDescription.id_;
        var opacity = nodeDescription.opacity;
        var scaleX = nodeDescription.scaleX;
        var scaleY = nodeDescription.scaleY;
        var skewX = nodeDescription.skewX;
        var skewY = nodeDescription.skewY;
        var anchorX = nodeDescription.anchorX;
        var anchorY = nodeDescription.anchorY;
        var rotation = nodeDescription.rotation;
        var jpath = nodeDescription.jpath;
        // Make sure size is in pixels.
        var size = UnitConverter._unitsToPixels([nodeDescription.sizeX, nodeDescription.sizeY], containerSize);

        // fill
        var classes = ['z2', 'backfaceVisibility'];
        var fillColor = UnitConverter.rgba2ColorString(nodeDescription.colorFill.fillColor);
        var filltype = nodeDescription.fillType;

        // node shadow
        var shadow = nodeDescription.nodeShadow;
        var shadowX = 0, shadowY = 0, shadowBlur = 0, shadowColor = "";
        if(null != shadow){
            shadowX = shadow.shadowOffset * Math.cos(shadow.shadowAngle);
            shadowY = shadow.shadowOffset * Math.sin(shadow.shadowAngle);
            shadowBlur = shadow.shadowWidth;
            if(!(shadowX === 0 && shadowY === 0 && shadowBlur == 0))
                shadowColor = UnitConverter.rgba2ColorString(shadow.shadowColor);
            else
                shadow = null;
        }

        // node stroke
        var stroke = nodeDescription.nodeStroke;
        var strokeAlpha = 0, strokeWidth = 0, strokeColor = "", strokeLineType = 0, strokeType = 0;
        if(null != stroke){
            strokeWidth = stroke.strokeWidth;
            if(0 != strokeWidth){
                strokeAlpha = stroke.strokeAlpha;
                strokeColor = UnitConverter.rgba2ColorString(stroke.strokeColor);
                strokeLineType = stroke.strokeLineType;
                strokeType = stroke.strokeType;
            }
            else
                stroke = null;
        }

        // only for text node
        var textBgColor = UnitConverter.rgba2ColorString(nodeDescription.color);
        var textVertAlign = nodeDescription.verticalAlignment;
        var textBlocks = nodeDescription.blocks;

        var newSurface = null;

        // --------------- constants -------------------
        ////单色填充
        var METCOLORFILLTYPE = 0;
        ////渐变填充
        var METGRADIENTFILLTYPE = 1;
        ////图片填充
        var METIMAGEFILLTYPE = 2;
        ////无填充
        var METNONEFILLTYPE = 3;

        // # 文本纵向对齐方式
        // 上对齐
        var MetTextNodeVerticalAlignmentTop = 0;
        // 居中对齐
        var MetTextNodeVerticalAlignmentCenter = 1;
        // 底对齐
        var MetTextNodeVerticalAlignmentBottom = 2;

        // # 描边线类型
        var MetStrokeLineStyleLine = 0;
        var MetStrokeLineStyleDot = 1;

        // # 描边位置类型
        var MetStrokeInner = 0;
        var MetStrokeOuter = 1;
        var MetStrokeMiddle = 2;

        if(type === "ShapeNode") {
            //newSurface = new Surface({
            //    size: size,
            //    content: name,
            //    properties: {
            //        backgroundColor: fillColor
            //    },
            //    classes: classes
            //});

            if (filltype === METIMAGEFILLTYPE) {
                newSurface = new ImageSurface({
                    size: size,
                    content: nodeDescription.imageFill.rawImageURL,
                    //properties: {
                    //    backgroundColor: fillColor
                    //},
                    classes: classes
                });
            } else {
                //TODO:using svg for compatibility
                newSurface = new CanvasSurface({
                    size: size,
                    classes: classes,
                    properties: {
                    }
                });

                newSurface.render = function render() {

                    var ctx = this.getContext('2d');

                    //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                    //ctx.fillStyle = fillColor;
                    //ctx.fill();


                    switch (filltype) {
                        //case METIMAGEFILLTYPE:
                        //{
                        //    var imageObj = new Image();
                        //    imageObj.src = nodeDescription.imageFill.rawImageURL;
                        //    imageObj.onload = function() {
                        //       ctx.save();
                        //        setJPath(ctx, jpath);
                        //        ctx.clip();
                        //        ctx.drawImage(imageObj, 0, 0, ctx.canvas.width, ctx.canvas.height);
                        //        ctx.restore();
                        //    };
                        //}
                        //    break;
                        case METCOLORFILLTYPE:
                        case METGRADIENTFILLTYPE:
                        {
                            ctx.save();
                            setJPath(ctx, jpath);
                            ctx.clip();
                            ctx.fillStyle = fillColor;
                            ctx.fill();
                            ctx.restore();

                        }
                            break;

                    }
                    return this.id;
                };
            }



        }

        if(type === "MetLineNode") {
            anchorX = 0;
            anchorY = 0.5;

            var startX = nodeDescription.lineStartPointX;
            var startY = nodeDescription.lineStartPointY;
            var endX = nodeDescription.lineEndPointX;
            var endY = nodeDescription.lineEndPointY;

            var leftMost = startX;

            if(leftMost < endX) {
                leftMost = endX;
            }

            if(leftMost === startX) {
                posX = startX;
                posY = startY;
            } else {
                posX = endX;
                posY = endY;
            }

            var dx = (posX === startX) ? (endX - startX) : (startX - endX);
            var dy = (posY === startY) ? (endY - startY) : (startY - endY);
            var len = Math.sqrt( ((dx * dx) + (dy * dy)) );

            size = [len, nodeDescription.lineWidth];

            var angle  = Math.atan2(dy, dx);

            rotation = angle;
            newSurface =  new Surface({
                size: size,
                properties: {
                    backgroundColor: fillColor
                },
                classes: classes
            });

            //DebugUtils.log(metNodeId + " fullcolor= " + fillColor);
        }

        //below is for debug info
        if(type === "MetNode"
            //|| type === "MetStateNode"
            //|| type === "MetScrollNode"
            )
        {
            newSurface = new Surface({
                size: size,
                content: name,
                classes: classes,
            //    properties: {
            //        border: '1px dashed rgb(210, 208, 203)'
            //    }
            });

        }
        else if(type === "MetScrollNode" || type === "MetStateNode"){
            //var imageUrl = "image\/386705-winter-solstice.jpg";
            //// url encode '(' and ')'
            //if ((imageUrl.indexOf('(') >= 0) || (imageUrl.indexOf(')') >= 0)) {
            //    imageUrl = imageUrl.split('(').join('%28');
            //    imageUrl = imageUrl.split(')').join('%29');
            //}

            newSurface = new ContainerSurface({
                size: size,
                classes: classes,
                properties: {
                    overflow:"hidden",
                    //border: "1px dashed rgba(0,255,0, .8)",
                    //borderRadius: "10px 0px 0px 10px",
                    //backgroundImage: 'url(' + imageUrl + ')'
                    //backgroundColor: 'gray'
                }
            });
        }

        if(type === "VideoNode") {
            var videoURL = nodeDescription.videoURL;
            newSurface = new Surface({
                //src: videoURL,
                size: size,
                classes: classes
            });
            var video_dom_id = "video-" + nodeDescription.id_;
            var videoParam = "<video id=" + video_dom_id;

            if(nodeDescription.autoplay === 1) {
                videoParam += " autoplay ";
            }

            if(nodeDescription.showCtrls === 1) {
                videoParam += " controls ";
            }

            if(nodeDescription.cover === 1) {
                videoParam += " poster=" + "image/BBB_480_Poster.jpg";
            }

            newSurface.setContent(videoParam + " src=\"" + videoURL + "\" width=" + size[0]+ "px" + " height=" + size[1]+ "px" + " </video>");

            newSurface.on("click", function() {
                var video = document.getElementById(video_dom_id);

                if(newSurface.videoPlay === true) {
                    video.pause();
                    newSurface.videoPlay = false;
                } else {
                    video.play();
                    newSurface.videoPlay = true;
                }
            })
        }

        if(type === "WebNode") {
            var webUrl = nodeDescription.URL;
            newSurface = new Surface({
                size: size,
                classes: classes,
                properties: {
                    backgroundColor: 'white'
                }
            });
            newSurface.setContent("<iframe src=\"" + webUrl + "\"" + " width=" + size[0]+ "px" + " height=" + size[1]+ "px </iframe>");

            newSurface.on("click", function() {
                //var video = document.getElementById(video_dom_id);
                DebugUtils.log("webnode click");
            })
        }

        if(type == "TextNode") {
            newSurface = new Surface({
                size: size,
                classes: classes,
                properties: {
                    backgroundColor: textBgColor,
                    display: "table",
                }
            });

            // html content for textNode
            var html = "<span style='display: table-cell; width:100%; margin:0px;";
            // text alignment in the TextNode
            if (MetTextNodeVerticalAlignmentCenter == textVertAlign)
                html += " vertial-align: middle; overflow:hidden;";
            else if (MetTextNodeVerticalAlignmentBottom == textVertAlign)
                html += " vertial-align: bottom; overflow:hidden;";
            else
                html += " vertial-align: top; overflow:hidden;";
            html += "'>";
            html += TextUtils.parseBlocks2Html(textBlocks, textVertAlign);
            html += "</span>";

            newSurface.setContent(html);
            newSurface.on("click", function () {
                DebugUtils.log("text node click");
            })

            // TextNode shadow setting
            if (null != shadow) {
                newSurface.setProperties({
                    boxShadow: (TextUtils.sprintf("%fpx %fpx %fpx 0px %s", shadowX, shadowY, shadowBlur, shadowColor)),
                });
            }
        }

        var newNode = new MetNodeView({
            size: size,
            metNodeId: id,
            name: name,
            zPosition: zPosition,
            opacity: opacity !== undefined ? opacity : 1,
            scaleX: scaleX,
            scaleY: scaleY,
            skewX: skewX,
            skewY: skewY,
            anchorX: anchorX,
            anchorY: anchorY,
            rotation: rotation,
            containerSize: containerSize,
            type: type,
            nodeDescription: nodeDescription
        });

        // show newSurface
        if(newSurface){
            if(type === "MetScrollNode" || type === "MetStateNode"){
                newNode.setContainerSurface(newSurface);
            }
            else{
                newNode.addSurface(newSurface);
            }
        }

        // for textNode use an extra surface to show border
        if(type == "TextNode" && null != stroke) {
            var a = (MetStrokeLineStyleDot == strokeLineType) ? "dashed" : "solid";
            var b = 0;
            if(MetStrokeOuter == strokeType)
                b = strokeWidth;
            else if(MetStrokeMiddle)
                b = strokeWidth/2;

            var borderSurface = new Surface({
                size: [size[0] + b, size[1] + b],
                classes: classes,
                properties: {
                    border: TextUtils.sprintf("%dpx %s %s", strokeWidth, a, strokeColor),
                }
            });
            newNode.setFloatingSurface(borderSurface);
        }

        if(type === "MetAnimNode") {
            newNode.setKeyFrameAnim(nodeDescription.keyframes, nodeDescription.duration, nodeDescription.autoreverses);
        }


        var subMetNodes = nodeDescription.nodes;
        var curMetPosZ = zPosition;
        for(var subMetNodenode in subMetNodes) {
            var newSubNode = this.makeMetNode(
                subMetNodes[subMetNodenode],
                size, curMetPosZ);
            newNode.addSubMetNode(newSubNode.metNode, newSubNode.zPos);
            curMetPosZ = newSubNode.zPos;
        }

        this.metNodesFromFactory[metNodeId] = newNode;

        newNode.setPositionPixels(posX, posY);

        //DebugUtils.log(name +
        //    //" Pos(" + UnitConverter.ratioXtoPixels(newNode.xPosition, containerSize[0]) + "," + UnitConverter.ratioXtoPixels(newNode.yPosition + containerSize[1]) + ") " +
        //    " Size(" + size[0] + "," + size[1] + ") " +
        //    " zPosition=" + zPosition +
        //    " fillColor=" + fillColor + " id_=" + metNodeId);

        return {metNode:newNode, zPos:curMetPosZ};

    }

    //function decimalToHexColorString(number)
    //{
    //    var colorStr = ((number>> 8) & 0xFFFFFF).toString(16).toUpperCase();
    //    //padding if necessary
    //    return "#" + "000000".substr(0, 6 - colorStr.length) + colorStr;
    //}

    function setJPath(context, jpath)
    {
        context.beginPath();
        for(var jpathcmd in jpath) {
            var value = jpath[jpathcmd];

            //close path
            if(value === "X") {
                break;
            }

            var cmd = value.split(" ");
            var op = cmd[0];
            if(op === "M") {
                context.moveTo(Math.round(cmd[1]), Math.round(cmd[2]));
            }
            if(op === "L") {
                context.lineTo(Math.round(cmd[1]), Math.round(cmd[2]));
            }
            if(op === "C") {
                context.bezierCurveTo(Math.round(cmd[1]), Math.round(cmd[2]),
                    Math.round(cmd[3]), Math.round(cmd[4]),
                    Math.round(cmd[5]), Math.round(cmd[6]));
            }

        }
        context.closePath();
    }

    //MetNodeFactory.prototype.makeMetNodeNew = function(name, nodeDescription, containerSize) {
    //    var newSurface;
    //
    //    if (nodeDescription.zPosition && nodeDescription.properties) {
    //        nodeDescription.properties.zPosition = nodeDescription.zPosition;
    //    }
    //
    //    // Make sure size is in pixels.
    //    nodeDescription.size = UnitConverter._unitsToPixels(nodeDescription.size, containerSize);
    //
    //    // Make sure position is in pixels.
    //    if (nodeDescription.position) {
    //        nodeDescription.position = UnitConverter._unitsToPixels(nodeDescription.position, containerSize);
    //    }
    //
    //
    //    var type = nodeDescription.type;
    //    var content = nodeDescription.content;
    //    var classes = nodeDescription.classes;
    //    var properties = nodeDescription.properties;
    //    var size = nodeDescription.size;
    //    var opacity = nodeDescription.opacity;
    //
    //    // Ensure backface visibility is set for all new surfaces.
    //    if (!classes) {
    //        classes = ['backfaceVisibility'];
    //    } else {
    //        classes.push('backfaceVisibility');
    //    }
    //
    //    if (type === 'html') {
    //        newSurface = new Surface({
    //            size: size,
    //            content: content,
    //            properties: properties,
    //            classes: classes
    //        });
    //        //newSurface = new CanvasSurface({
    //        //    size: size,
    //        //    properties: properties,
    //        //    classes: classes
    //        //});
    //        //newSurface.render = function render() {
    //        //
    //        //    var ctx = this.getContext('2d');
    //        //
    //        //    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    //        //
    //        //    //ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    //        //    //ctx.moveTo(10, i);
    //        //    //ctx.lineTo(60, i);
    //        //    //ctx.stroke();
    //        //
    //        //    //if (i++ > ctx.canvas.height) i = 0;
    //        //
    //        //    return this.id;
    //        //};
    //
    //    }
    //
    //    if (type === 'image') {
    //        //newSurface = new BgImageSurface({
    //        //    sizeMode: BgImageSurface.SizeMode.ASPECTFILL,
    //        //    content: content,
    //        //    properties: properties,
    //        //    classes: classes
    //        //});
    //        newSurface = new ImageSurface({
    //                size: size,
    //                content: content,
    //                properties: properties,
    //                classes: classes
    //        });
    //    }
    //
    //    var newNode = new MetNodeView({
    //        name: name,
    //        zPosition: properties.zPosition,
    //        opacity: opacity !== undefined ? opacity : 1,
    //        containerSize:containerSize
    //    });
    //
    //    newNode.addSurface(newSurface);
    //
    //    var subMetNodes = nodeDescription.nodes;
    //    for(var subMetNodenode in subMetNodes) {
    //        var newSubNode = this.makeMetNodeNew(
    //            subMetNodes[subMetNodenode].name,
    //            subMetNodes[subMetNodenode],
    //            nodeDescription.size);
    //        newNode.addSubMetNode(newSubNode);
    //    }
    //
    //
    //
    //
    //    this.metNodesFromFactory[name] = newNode;
    //
    //    newNode.setPositionPixels(nodeDescription.position[0], nodeDescription.position[1]);
    //
    //    return newNode;
    //};

    //MetNodeFactory.prototype.makeMetNode = function(name, type, content, classes, properties, size, opacity, scrollStart, scrollStop) {
    //    var newSurface;
    //
    //    // Ensure backface visibility is set for all new surfaces.
    //    if (!classes) {
    //        classes = ['backfaceVisibility'];
    //    } else {
    //        classes.push('backfaceVisibility');
    //    }
    //
    //    if (type === 'html') {
    //        newSurface = new Surface({
    //            size: size,
    //            content: content,
    //            properties: properties,
    //            classes: classes
    //        });
    //    }
    //
    //    if (type === 'image') {
    //        //newSurface = new BgImageSurface({
    //        //    sizeMode: BgImageSurface.SizeMode.ASPECTFILL,
    //        //    content: content,
    //        //    properties: properties,
    //        //    classes: classes
    //        //});
    //        newSurface = new ImageSurface({
    //            size: size,
    //            content: content,
    //            properties: properties,
    //            classes: classes
    //        });
    //    }
    //
    //    var newNode = new MetNodeView({
    //        name: name,
    //        zPosition: properties.zPosition,
    //        opacity: opacity !== undefined ? opacity : 1
    //    });
    //
    //    newNode.addSurface(newSurface);
    //
    //    this.metnodes[name] = newNode;
    //
    //    return newNode;
    //};

    MetNodeFactory.prototype.getMetNode = function(metNodeId) {
        return this.metNodesFromFactory[metNodeId];
    };

    module.exports = MetNodeFactory;
});
