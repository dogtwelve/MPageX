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
    var DebugUtils = require('utils/DebugUtils');

    function MetNodeFactory() {
          // Container to store created actors by name.
          this.metNodesFromFactory = {};
    }

    MetNodeFactory.prototype.makeMetNode = function(nodeDescription, containerSize, zPosition) {

        if (nodeDescription.zPosition && nodeDescription.properties) {
            nodeDescription.properties.zPosition = nodeDescription.zPosition;
        }

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

        var classes = ['z2', 'backfaceVisibility'];
        var fillColor = UnitConverter.decimalToHexColorString(nodeDescription.colorFill.fillColor);
        var filltype = nodeDescription.fillType;


        var newSurface;


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
            type: type
        });

        ////单色填充
        var METCOLORFILLTYPE = 0;
        ////渐变填充
        var METGRADIENTFILLTYPE = 1;
        ////图片填充
        var METIMAGEFILLTYPE = 2;
        ////无填充
        var METNONEFILLTYPE = 3;


        if(type === "ShapeNode") {
            newSurface = new Surface({
                size: size,
                content: name,
                properties: {
                    backgroundColor: fillColor
                },
                classes: classes
            });

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
                //newSurface = new CanvasSurface({
                //    size: size,
                //    classes: classes,
                //    properties: {
                //    }
                //});
                //
                //newSurface.render = function render() {
                //
                //    var ctx = this.getContext('2d');
                //
                //    //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                //
                //    //ctx.fillStyle = fillColor;
                //    //ctx.fill();
                //
                //
                //    switch (filltype) {
                //        //case METIMAGEFILLTYPE:
                //        //{
                //        //    var imageObj = new Image();
                //        //    imageObj.src = nodeDescription.imageFill.rawImageURL;
                //        //    imageObj.onload = function() {
                //        //       ctx.save();
                //        //        setJPath(ctx, jpath);
                //        //        ctx.clip();
                //        //        ctx.drawImage(imageObj, 0, 0, ctx.canvas.width, ctx.canvas.height);
                //        //        ctx.restore();
                //        //    };
                //        //}
                //        //    break;
                //        case METCOLORFILLTYPE:
                //        case METGRADIENTFILLTYPE:
                //        {
                //            ctx.save();
                //            setJPath(ctx, jpath);
                //            ctx.clip();
                //            ctx.fillStyle = fillColor;
                //            ctx.fill();
                //            ctx.restore();
                //
                //        }
                //            break;
                //
                //    }
                //    return this.id;
                //};
            }



        }

        //below is for debug info
        if(
            type === "MetNode"
            || type === "MetStateNode"
            || type === "MetScrollNode"
        ) {
            newSurface = new Surface({
                size: size,
                content: name,
                properties: {
                    backfaceVisibility: 'visible',
                    border: '1px solid rgb(210, 208, 203)'
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
                size: size
            });
            newSurface.setContent("<DIV><IFRAME src=\"" + webUrl + "\"</IFRAME></DIV>");
        }

        if(newSurface) {
            newNode.addSurface(newSurface);
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

        newNode.setPositionPixels(nodeDescription.positionX, nodeDescription.positionY);

        DebugUtils.log(name +
            //" Pos(" + UnitConverter.ratioXtoPixels(newNode.xPosition, containerSize[0]) + "," + UnitConverter.ratioXtoPixels(newNode.yPosition + containerSize[1]) + ") " +
            " Size(" + size[0] + "," + size[1] + ") " +
            " zPosition=" + zPosition +
            " fillColor=" + fillColor + " id_=" + metNodeId);

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
