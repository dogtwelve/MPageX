define(function(require, exports, module) {
    'use strict';
	var MetNodeView = require('views/MetNodeView');
	var UnitConverter = require('tools/UnitConverter');
	var Surface = require('famous/core/Surface');
	var ImageSurface = require('famous/surfaces/ImageSurface');
	var VideoSurface = require("famous/surfaces/VideoSurface");
	var CanvasSurface = require('famous/surfaces/CanvasSurface');
	var UnitConverter = require('tools/UnitConverter');
	var ContainerSurface = require("famous/surfaces/ContainerSurface");

	// for gravity interaction
	var PhysicsEngine = require('famous/physics/PhysicsEngine');
	var Rectangle = require('famous/physics/bodies/Rectangle');
	var VectorField = require('famous/physics/forces/VectorField');
	var Walls = require('famous/physics/constraints/Walls');

	var Timer = require("famous/utilities/Timer");

	var DebugUtils = require('utils/DebugUtils');
	var TextUtils = require('utils/TextUtils');
	var EasingUtils = require('utils/EasingUtils');

	var Transform = require('famous/core/Transform');
	var TransformUtils = require('utils/TransformUtils');

	var MetNodeAction = require('actions/MetNodeAction');
	var MetHook = require('actions/MetHook');


    var timers = 0;
	var MetNodeFactory = {
		metNodesFromFactory: {},
        metNodesEvent:{},
		makeMetNode: function (nodeDescription, containerSize, zPosition) {
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
			if (null != shadow) {
				shadowX = shadow.shadowOffset * Math.cos(shadow.shadowAngle);
				shadowY = shadow.shadowOffset * Math.sin(shadow.shadowAngle);
				shadowBlur = shadow.shadowWidth;
				if (!(shadowX === 0 && shadowY === 0 && shadowBlur == 0))
					shadowColor = UnitConverter.rgba2ColorString(shadow.shadowColor);
				else
					shadow = null;
			}

			// node stroke
			var stroke = nodeDescription.nodeStroke;
			var strokeWidth = 0, strokeColor = "", strokeLineType = 0, strokeType = 0;
			if (null != stroke) {
				strokeWidth = stroke.strokeWidth;
				if (0 != strokeWidth) {
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

			// actions for nodes
			var nodeActions = MetNodeAction.parseActionsFromArray(nodeDescription.actions);

			var newSurface = null;
			var newContainerSurface = null;

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

			if (type === "ShapeNode") {
				if (MetNodeAction.hasEraseOneInActions(nodeActions)) {
					newSurface = new CanvasSurface({
						size: size,
						classes: classes,
						properties: {}
					});
				}
				else {
					newSurface = new Surface({
						size: size,
						classes: classes,
						properties: {}
					});
					// get imageRect
					//"imageRect" : "{{-850.35943603515625, -0.00079511082731187344}, {1616.3837890625, 1048.1239013671875}}",
					if (filltype === METIMAGEFILLTYPE) {
						var ir = [0, 0, size[0], size[1]];
						var ir = nodeDescription.imageFill.imageRect;
						ir = ir.replace(/[\{\}]/g, "");
						ir = ir.split(",");
						if (ir instanceof Array)
							for (var i = 0; i < ir.length; i++) ir[i] = Number(ir[i]);
						var content = TextUtils.sprintf("<img src='zres/%s' style='position:absolute; left:%dpx; top:%dpx; width:%dpx; height:%dpx;'/>",
							nodeDescription.imageFill.rawImageURL, ir[0], ir[1], ir[2], ir[3]);
						newSurface.setContent(content);
					}
					else
						newSurface.setProperties({backgroundColor: fillColor});
				}
			}

			if (type === "MetLineNode") {
				anchorX = 0;
				anchorY = 0.5;

				var startX = nodeDescription.lineStartPointX;
				var startY = nodeDescription.lineStartPointY;
				var endX = nodeDescription.lineEndPointX;
				var endY = nodeDescription.lineEndPointY;

				var leftMost = startX;

				if (leftMost < endX) {
					leftMost = endX;
				}

				if (leftMost === startX) {
					posX = startX;
					posY = startY;
				} else {
					posX = endX;
					posY = endY;
				}

				var dx = (posX === startX) ? (endX - startX) : (startX - endX);
				var dy = (posY === startY) ? (endY - startY) : (startY - endY);
				var len = Math.sqrt(((dx * dx) + (dy * dy)));

				size = [len, nodeDescription.lineWidth];

				var angle = Math.atan2(dy, dx);

				rotation = angle;
				newSurface = new Surface({
					size: size,
					properties: {
						backgroundColor: fillColor
					},
					classes: classes
				});

				//DebugUtils.log(metNodeId + " fullcolor= " + fillColor);
			}

			//below is for debug info
			if (type === "MetNode"
			//|| type === "MetStateNode"
			//|| type === "MetScrollNode"
			) {
				newSurface = new Surface({
					size: size,
					//content: name,
					classes: classes
					//    properties: {
					//        border: '1px dashed rgb(210, 208, 203)'
					//    }
				});
			}
			if (type === "MetScrollNode"
				|| type === "MetStateNode"
				|| type === "MetAnimNode"
				|| type === "ButtonNode") {
				//var imageUrl = "image\/386705-winter-solstice.jpg";
				//// url encode '(' and ')'
				//if ((imageUrl.indexOf('(') >= 0) || (imageUrl.indexOf(')') >= 0)) {
				//    imageUrl = imageUrl.split('(').join('%28');
				//    imageUrl = imageUrl.split(')').join('%29');
				//}

				newContainerSurface = new ContainerSurface({
					size: size,
					classes: classes,
					properties: {
						overflow: "hidden"
						//border: "1px dashed rgba(0,255,0, .8)",
						//borderRadius: "10px 0px 0px 10px",
						//backgroundImage: 'url(' + imageUrl + ')'
						//backgroundColor: 'gray'
					}
				});
			}

			if (type === "AudioNode") {
				var audioURL = "zres/" + nodeDescription.audioURL;
				newSurface = new Surface({
					//src: videoURL,
					size: size,
					classes: classes
				});
				var audio_dom_id = "audio-" + nodeDescription.id_;
				var audioParam = "<audio id=" + audio_dom_id;

				if (nodeDescription.autoplay === 1) {
					audioParam += " autoplay ";
				}

				if (nodeDescription.loop === 1) {
					audioParam += " loop ";
				}

				newSurface.setContent(audioParam + " src=\"" + audioURL + "\" </audio>");
			}

			if (type === "VideoNode") {
				var videoURL = "zres/" + nodeDescription.videoURL;
				newSurface = new Surface({
					//src: videoURL,
					size: size,
					classes: classes
				});
				var video_dom_id = "video-" + nodeDescription.id_;
				var videoParam = "<video id='" + video_dom_id+ "' webkit-playsinline";

				if (nodeDescription.autoplay === 1) {
					videoParam += " autoplay ";
				}

				if (nodeDescription.showCtrls === 1) {
					videoParam += " controls ";
				}

				if (nodeDescription.cover === 1) {
					//videoParam += " poster=" + "image/BBB_480_Poster.jpg";
				}

				newSurface.setContent(videoParam + " src='" + videoURL + "' width='" + size[0] + "px'" + " height='" + size[1] + "px'>"+" </video>");

				newSurface.on("click", function () {
					var video = document.getElementById(video_dom_id);

					if (newSurface.videoPlay === true) {
						video.pause();
						newSurface.videoPlay = false;
					} else {
						video.play();
						newSurface.videoPlay = true;
					}
				})
			}

			if (type === "WebNode") {
				var webUrl = nodeDescription.URL;
				newSurface = new Surface({
					size: size,
					classes: classes,
					properties: {
						backgroundColor: 'white'
					}
				});
				newSurface.setContent("<iframe src=\"" + webUrl + "\"" + " width=" + size[0] + "px" + " height=" + size[1] + "px </iframe>");

				newSurface.on("click", function () {
					//var video = document.getElementById(video_dom_id);
					DebugUtils.log("webnode click");
				})
			}

			if (type == "TextNode") {
				newSurface = new Surface({
					size: size,
					classes: classes,
					properties: {
						backgroundColor: textBgColor,
						display: "table"
					}
				});

				// html content for textNode
				var html = "<div style='width:100%; height:100%;";
				// text alignment in the TextNode
				if (MetTextNodeVerticalAlignmentCenter == textVertAlign)
					html += " vertial-align: middle; overflow:hidden;";
				else if (MetTextNodeVerticalAlignmentBottom == textVertAlign)
					html += " vertial-align: bottom; overflow:hidden;";
				else
					html += " vertial-align: top; overflow:hidden;";
				html += "'>";
				html += TextUtils.parseBlocks2Html(nodeDescription.text, textBlocks);
				html += "</div>";

				newSurface.setContent(html);
				newSurface.on("click", function () {
					DebugUtils.log("text node click");
				})

				// TextNode shadow setting
				if (null != shadow) {
					newSurface.setProperties({
						boxShadow: (TextUtils.sprintf("%fpx %fpx %fpx 0px %s", shadowX, shadowY, shadowBlur, shadowColor))
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
				nodeDescription: nodeDescription,
			});
			newNode.nodeActions = nodeActions;

			// show newSurface
			if (newContainerSurface) {
				newNode.setContainerSurface(newContainerSurface);
			}

			if (!newSurface) {
				if (newContainerSurface) {
					newSurface = new Surface({
						size: size
						//properties: {
						//    border: '1px dashed rgb(210, 208, 203)',
						//    backgroundColor: 'white'
						//}
					});
				} else {
					newSurface = new Surface({
						size: size,
						classes: classes
						//properties: {
						//    border: '1px dashed rgb(210, 208, 203)',
						//    backgroundColor: 'white'
						//}
					});
				}

			}

			newNode.addSurface(newSurface);

			// Interaction parts - 1
			if(type == "MetScrollNode" || type == "MetAnimNode" || type == "MetStateNode") {
				// down
				var _on_down = function (e) {
					e.preventDefault();MetHook.flagActiveNodeID(id);
					if(type == "MetAnimNode")
						MetHook.flagInactiveNodeID(id);
				};
				newNode.on("mousedown", _on_down);
				newNode.on("touchstart", _on_down);
			}
            // Interaction parts - 2
            this.metNodesEvent[nodeDescription.id_]={};
            //获取当前Surface原始dom对象
			var target;
            switch(newSurface.elementType){
                case "canvas": target = newSurface._backBuffer; break;
                case "div": target = newSurface._container; break;
            }
            if(nodeActions.length > 0){
                for(var k in nodeActions){
                    var obj = nodeActions[k];
					// 映射关联关系
					obj.registerHooks();
                    // 播放(autoplay)
                    if(MetNodeAction.MetNodeActionTypeAuto == obj.actionType){
                        this.metNodesEvent[nodeDescription.id_]["autoPlay"] = function(){
                            obj.executePerforms();
                        }
                    }
                    // 点击(tap)
                    else if(MetNodeAction.MetNodeActionTypeTap == obj.actionType) {
						this.metNodesEvent[nodeDescription.id_]["click"] = function () {
							if (type == "MetAnimNode") {
								if (!newNode.nodeDesc.autoplay)
									;
								else if (newNode.curKeyframeAnim.isPaused() === true)
									newNode.curKeyframeAnim.resumeAnim();
								else
									newNode.curKeyframeAnim.pauseAnim();
							}
							else if (type == "MetStateNode") {
								if (!newNode.nodeDesc.autoplay)
									;
								else if (!newNode.curStateAnim.isPlaying())
									newNode.curStateAnim.autoPlay();
								else
									newNode.curStateAnim.stopPlay();
							}
							else if (type == "ButtonNode") {
								newNode.curStateAnim.showNextState();
								if (newNode.curStateAnim.curStateIdx === 0) {
									//on state
									DebugUtils.log(id + " button off");
								}
								else {
									//off state
									DebugUtils.log(id + " button on");
								}
							}
							obj.executePerforms();
						}
					}
                    // 双击(doubleTap)
                    else if(MetNodeAction.MetNodeActionTypeDoubleTap == obj.actionType){
                        this.metNodesEvent[nodeDescription.id_]["doubleClick"] = function(){
                            obj.executePerforms();
                        }
                    }
                    // 长按(longTap)
                    else if(MetNodeAction.MetNodeActionTypeLongTap == obj.actionType){
                        this.metNodesEvent[nodeDescription.id_]["longClick"] = function(){
                            obj.executePerforms();

                        }
                    }
                    // 缩放(zoom)
                    else if(MetNodeAction.MetNodeActionTypeZoom == obj.actionType) {
						obj.executePerforms();
						var act = obj;
						var min_factor = act.f1 || .5;
						var max_factor = act.f2 || 2;

						var init_distance = null;
						var curr_distance = null;

						// down
						var _on_down = function (e) {
							e.preventDefault();
							if (e.changedTouches.length >= 2) {
								var x0 = e.changedTouches[0].clientX, y0 = e.changedTouches[0].clientY;
								var x1 = e.changedTouches[1].clientX, y1 = e.changedTouches[1].clientY;
								init_distance = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
							}
							else
								init_distance = null;
						};
						newSurface.on("touchstart", _on_down);

						// move
						var _on_move = function (e) {
							e.preventDefault();
							if (null == init_distance)
								return;
							if (e.changedTouches.length >= 2) {
								var x0 = e.changedTouches[0].clientX, y0 = e.changedTouches[0].clientY;
								var x1 = e.changedTouches[1].clientX, y1 = e.changedTouches[1].clientY;
								curr_distance = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
								alert(curr_distance);
							}
							else
								curr_distance = null;
						};
						newSurface.on("touchmove", _on_move);

						// up
						var _on_up = function (e) {
							e.preventDefault();
							if (null != init_distance && null != curr_distance) {
								act.executePerforms();
							}
							init_distance = null;
							curr_distance = null;
						};
						newSurface.on("touchcancel", _on_up);
						newSurface.on("touchend", _on_up);
					}
                    // 拖拽(drag)
                    else if(MetNodeAction.MetNodeActionTypeDrag == obj.actionType){
                        this.metNodesEvent[nodeDescription.id_]["drag"] = function(e) {
							e.preventDefault();
							if (null == dragOptions.fromPos)
								return;
							dragOptions.toPos = [e.clientX || e.changedTouches[0].clientX, e.clientY || e.changedTouches[0].clientY];

							var delta = [dragOptions.toPos[0] - dragOptions.fromPos[0], dragOptions.toPos[1] - dragOptions.fromPos[1]];

							var trans = TransformUtils.transformFromElement(target, document.body);
							delta = TransformUtils.vectorApplyTransform(delta, trans);

							var me_trans = Transform.rotateZ(newNode.rotationZ);
							delta = TransformUtils.vectorApplyTransform(delta, me_trans);
							var px = newNode.xPosition * newNode.containerSize[0] + delta[0];
							var py = newNode.yPosition * newNode.containerSize[1] + delta[1];
							newNode.xPosition = px / newNode.containerSize[0];
							newNode.yPosition = py / newNode.containerSize[1];
							obj.executePerforms();
						}
                    }
                    // 滚动
                    else if(MetNodeAction.MetNodeActionTypeScroll == obj.actionType){
                    }
                    // 猛滑
                    else if(MetNodeAction.MetNodeActionTypeSlide == obj.actionType){
                        var act = obj;
                        var toX = act.f2, toY = act.f4;
                        var dir = act.i1; // TODO: 处理方向相关
                        var easing = act.i2;
                        var fromPos = null, toPos = [];

                        // down
                        var _on_down = function (e) {
                            e.preventDefault();
                            fromPos = [e.clientX || e.changedTouches[0].clientX, e.clientY || e.changedTouches[0].clientY];
                        };
                        newSurface.on("mousedown", _on_down);
                        newSurface.on("touchstart", _on_down);

                        // move
                        var _on_move = function (e) {
                            e.preventDefault();
                            if (null == fromPos)
                                return;
                            toPos = [e.clientX || e.changedTouches[0].clientX, e.clientY || e.changedTouches[0].clientY];

                            var delta = [toPos[0] - fromPos[0], toPos[1] - fromPos[1]];
                            var _self = newSurface._currentTarget;
                            var trans = TransformUtils.transformFromElement(_self, document.body);
                            delta = TransformUtils.vectorApplyTransform(delta, trans);

                            var me_trans = Transform.rotateZ(newNode.rotationZ);
                            delta = TransformUtils.vectorApplyTransform(delta, me_trans);

                            newNode.xPosition += delta[0] / newNode.containerSize[0];
                            newNode.yPosition += delta[1] / newNode.containerSize[1];

                            fromPos = toPos;
                        };
                        newSurface.on("mousemove", _on_move);
                        newSurface.on("touchmove", _on_move);

                        // up
                        var _on_up = function (e) {
                            e.preventDefault();
                            if (null != fromPos) {
                                var fromPosition = [newNode.xPosition, newNode.yPosition];
                                var toPosition = [toX / newNode.containerSize[0], toY / newNode.containerSize[1]];
                                var ef = EasingUtils.easingFuncBy(easing);
                                var ticks = 20;
                                for (var i = 0; i < ticks; i++) {
                                    var process = ef((i + 1) / ticks);
                                    var pos = [
                                        fromPosition[0] + (toPosition[0] - fromPosition[0]) * process,
                                        fromPosition[1] + (toPosition[1] - fromPosition[1]) * process,
                                    ];
                                    Timer.after(
                                        function (finished) {
                                            newNode.xPosition = this.pos[0];
                                            newNode.yPosition = this.pos[1];
                                            if (finished) {
                                                act.executePerforms();
                                            }
                                        }.bind({"pos": pos}, i === ticks - 1),
                                        i
                                    );
                                }
                            }
                            fromPos = null;
                        };
                        newSurface.on("mouseout", _on_up);
                        newSurface.on("touchcancel", _on_up);
                        newSurface.on("mouseup", _on_up);
                        newSurface.on("touchend", _on_up);
                    }
                    // 涂抹
                    else if(MetNodeAction.MetNodeActionTypeErase == obj.actionType){
                        var act = obj;
                        var radius = Math.floor(act.f1);
                        var percent = act.f2;

                        var _resetAll = function () {
                            var ctx = newSurface.getContext('2d');
                            switch (filltype) {
                                case METIMAGEFILLTYPE:
                                {
                                    var imageObj = new Image();
                                    imageObj.src = "zres/" + nodeDescription.imageFill.rawImageURL;
                                    imageObj.onload = function () {
                                        ctx.save();
                                        setJPath(ctx, jpath);
                                        ctx.clip();
                                        ctx.drawImage(imageObj, 0, 0, ctx.canvas.width, ctx.canvas.height);
                                        ctx.restore();
                                    };
                                }
                                    break;
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
                        };

                        var _eraseAll = function () {
                            var ctx = newSurface.getContext('2d');
                            ctx.save();
                            ctx.clearRect(0, 0, size[0], size[1]);
                            ctx.restore();
                        };

                        var canvas_tick = 0;
                        var needDraw = false;
                        var finished = false;
                        var fromPos = [];

                        var _checkCleanedPercent = function (ctx) {
                            if (finished)
                                return;
                            var cw = ctx.canvas.width, ch = ctx.canvas.height;
                            var data = ctx.getImageData(0, 0, cw, ch);
                            data = data.data;
                            // check if cleaned enough
                            var needed = cw * ch * percent;
                            var cleaned = 0;
                            for (var i = 0; i < data.length; i += 4) {
                                if (data[i + 3] === 0) cleaned++;
                                if (cleaned >= needed) break;
                            }
                            if (cleaned >= needed) {
                                finished = true;
                                _eraseAll();
                                act.executePerforms();
                            }
                        };

                        newSurface.render = function render() {
                            if (canvas_tick > 1) return this.id;
                            if (canvas_tick === 1) _resetAll();
                            canvas_tick++;

                            return this.id;
                        };

                        // down
                        var _on_down = function (e) {
                            e.preventDefault();
                            if (canvas_tick <= 1)
                                return;

                            var _self = newSurface._currentTarget;
                            var trans = TransformUtils.transformFromElement(_self, document.body);
                            fromPos = [e.clientX || e.changedTouches[0].clientX, e.clientY || e.changedTouches[0].clientY];
                            fromPos = TransformUtils.pointApplyTransform(fromPos, trans);
                            needDraw = true;
                        };
                        newSurface.on("mousedown", _on_down);
                        newSurface.on("touchstart", _on_down);

                        // move
                        var _on_move = function (e) {
                            e.preventDefault();
							e.stopPropagation();
                            if (!needDraw)
                                return;

                            var _self = newSurface._currentTarget;
                            var trans = TransformUtils.transformFromElement(_self, document.body);
                            var toPos = [e.clientX || e.changedTouches[0].clientX, e.clientY || e.changedTouches[0].clientY];
                            toPos = TransformUtils.pointApplyTransform(toPos, trans);

                            var ctx = newSurface.getContext('2d');

                            ctx.save();
                            ctx.beginPath();

                            var angle = Math.atan2(toPos[1] - fromPos[1], toPos[0] - fromPos[0]);
                            ctx.arc(fromPos[0], fromPos[1], radius, angle - Math.PI / 2, angle + Math.PI / 2, true);
                            ctx.arc(toPos[0], toPos[1], radius, angle - Math.PI * 3 / 2, angle - Math.PI / 2, true);
                            ctx.closePath();

                            ctx.clip();
                            ctx.clearRect(Math.min(fromPos[0], toPos[0]) - radius, Math.min(fromPos[1], toPos[1]) - radius, Math.abs(toPos[0] - fromPos[0]) + radius * 2, Math.abs(toPos[1] - fromPos[1]) + radius * 2);
                            ctx.restore();

                            fromPos = toPos;
                        };
                        newSurface.on("mousemove", _on_move);
                        newSurface.on("touchmove", _on_move);

                        // cancel
                        var _on_cancel = function (e) {
                            e.preventDefault();

                            if (!needDraw) return;
                            needDraw = false;
                            // check if cleaned enough
                            var ctx = newSurface.getContext('2d');
                            _checkCleanedPercent(ctx);
                        };
                        newSurface.on("mouseout", _on_cancel);
                        newSurface.on("touchcancel", _on_cancel);

                        // up
                        var _on_up = function (e) {
                            e.preventDefault();
                            needDraw = false;
                            // check if cleaned enough
                            var ctx = newSurface.getContext('2d');
                            _checkCleanedPercent(ctx);
                        };
                        newSurface.on("mouseup", _on_up);
                        newSurface.on("touchend", _on_up);
                    }
                    // 重力感应(gravity)
                    else if(MetNodeAction.MetNodeActionTypeGravity == obj.actionType) {
                        if (!window.DeviceMotionEvent) {
                            console.log('亲，你的浏览器不支持DeviceMotionEvent哦~');
                            continue;
                        }

                        var act = obj;
                        var fromX = Math.min(act.f1, act.f2), toX = Math.max(act.f1, act.f2);
                        var fromY = Math.min(act.f3, act.f4), toY = Math.max(act.f3, act.f4);
                        var gravity = act.f5;

                        var px = newNode.xPosition * newNode.containerSize[0];
                        var py = newNode.yPosition * newNode.containerSize[1];

                        var physics = new PhysicsEngine();
                        var rectBody = new Rectangle({
                            position: [px, py, 0],
                            origin: [.5, .5],
                            size: size
                        });
                        physics.addBody(rectBody);

                        var walls = new Walls({
                            align: [fromX / newNode.containerSize[0], fromY / newNode.containerSize[1]],
                            origin: [0, 0],
                            size: [toX - fromX, toY - fromY],
                            sides: Walls.TWO_DIMENSIONAL
                        });
                        var gravity = new VectorField({
                            strength: 0.0001,
                            direction: [0, 0, 0],
                            field: VectorField.FIELDS.LINEAR
                        });
                        physics.attach([walls.components[0], walls.components[1], walls.components[2], walls.components[3], gravity], rectBody);

                        Timer.every(function () {
                            var modifier = newNode.baseModifier;
                            if (modifier) {
                                modifier.setTransform(rectBody.getTransform());
                            }
                        }, 60);

                        var _on_device_motion = function (eventData) {
                            var acceleration = eventData.accelerationIncludingGravity;
                            var facingUp = -1;
                            if (acceleration.z > 0) {
                                facingUp = +1;
                            }
                            var tiltLR = Math.round(((acceleration.x) / 9.81) * -90);
                            var tiltFB = Math.round(((acceleration.y + 9.81) / 9.81) * 90 * facingUp);

                            var rotation = "rotate(" + tiltLR + "deg) rotate3d(1,0,0, " + (tiltFB) + "deg)";
                            newSurface.setContent(rotation);
                        };
                        window.addEventListener('devicemotion', _on_device_motion, false);
                    }
                };
                //拖动事件参数配置
                var dragOptions = {};
                var eventOptions = {
                    isDrag:false
                }
                var longTimeOut;//长按事件
                var doubleClickTimeOut;//双击事件
                var clickTimeOut;//单击事件
                var clearTimeOuts;
                var _clickEvent = function(e){
                    if(MetNodeFactory.metNodesEvent[nodeDescription.id_]["click"]){
                        clickTimeOut = window.setTimeout(function(){
                            timers = 1;
                            window.clearTimeout(clickTimeOut);
                        },150);
                    }
                };
                var _doubleClickEvent = function(){
                    if(MetNodeFactory.metNodesEvent[nodeDescription.id_]["doubleClick"]){
                        doubleClickTimeOut = window.setTimeout(function(){
                            if(timers == 2){
                                timers = 4;//双击事件标示
                            }else{
                                timers = 2;
                            }
                            window.clearTimeout(doubleClickTimeOut);
                        },50);
                    }
                };
                var longClickEvent = function(e){
                    if(MetNodeFactory.metNodesEvent[nodeDescription.id_]["longClick"]){
                        //设定500微妙过后触发事件为长按事件
                        longTimeOut = window.setTimeout(function(){
                                MetNodeFactory.metNodesEvent[nodeDescription.id_].longClick();
                                timers = 0;
                                window.clearTimeout(longTimeOut);
                        },700);
                    }
                };
                var _bindEvent = function(e){
                    //var e = window.event;
                    _doubleClickEvent(e);
                    _clickEvent(e);
                    longClickEvent(e);
                    _dragEvent(e);
                };
                var _removeEvent = function(e){
                    newSurface.isDrag = false;
                    window.clearTimeout(longTimeOut);
                    window.clearTimeout(clickTimeOut);
                    clearTimeOuts = window.setTimeout(function(){
                        timers = 0;
                        window.clearTimeout(clearTimeOuts);
                    },1000)
                    if(timers == 1){
                        timers = 0;
                        MetNodeFactory.metNodesEvent[nodeDescription.id_].click();
                    }else if(timers == 4){
                        timers = 0;
                        MetNodeFactory.metNodesEvent[nodeDescription.id_].doubleClick();
                    }
                };
                var _dragEvent = function(e){
                    if(!MetNodeFactory.metNodesEvent[nodeDescription.id_]["drag"]){
                        eventOptions.isDrag = false;//不允许拖拽
                    }else{//初始化可拖拽参数
                        dragOptions["act"] = obj;
                        dragOptions["fromX"] = Math.min(dragOptions.f1, dragOptions.f2), dragOptions["toX"] = Math.max(dragOptions.f1, dragOptions.f2);
                        dragOptions["fromY"] = Math.min(dragOptions.f3, dragOptions.f4), dragOptions["toY"] = Math.max(dragOptions.f3, dragOptions.f4);
                        dragOptions["dir"] = dragOptions.i1;
                        dragOptions["fromPos"] = [e.clientX || e.changedTouches[0].clientX, e.clientY || e.changedTouches[0].clientY];
                        dragOptions["toPos"] = [];
                        newSurface.isDrag = true;
                    }

                }
                if(this.IsPC()){
                    newSurface.on("mousedown",_bindEvent);
                    newSurface.on("mousemove",function(e){
                            if(newSurface.isDrag){
                                MetNodeFactory.metNodesEvent[nodeDescription.id_].drag(e);
                            }
                        }
                    )
                    document.addEventListener("mouseup",function(){
                        newSurface.isDrag = false;
                        newSurface.dragOptions = {};
                    },false)
                    newSurface.on("mouseup",_removeEvent);
                }else{
                    newSurface.on("touchstart",_bindEvent);
                    newSurface.on("touchmove",function(e){
                            switch (e.targetTouches.length){
                                case 1:
                                    if(newSurface.isDrag){//是否激活拖拽
                                        MetNodeFactory.metNodesEvent[nodeDescription.id_].drag(e);
                                    }
                                    break;
                                case 2:

                                    break;
                            }

                        }
                    )
                    newSurface.on("touchend",_removeEvent);
                    document.addEventListener("touchend",function(){
                        newSurface.isDrag = false;
                        newSurface.dragOptions = {};
                    },false)
                }

            }

			// for textNode use an extra surface to show border
			if (type == "TextNode" && null != stroke) {
				var a = (MetStrokeLineStyleDot == strokeLineType) ? "dashed" : "solid";
				var b = 0;
				if (MetStrokeOuter == strokeType)
					b = strokeWidth;
				else if (MetStrokeMiddle)
					b = strokeWidth / 2;

				var borderSurface = new Surface({
					size: [size[0] + b, size[1] + b],
					classes: classes,
					properties: {
						border: TextUtils.sprintf("%dpx %s %s", strokeWidth, a, strokeColor)
					}
				});
				newNode.setFloatingSurface(borderSurface);
			}

			var subMetNodes = [];
            // make a copy, because we might modify it before displaying
            for(var i in nodeDescription.nodes)
                subMetNodes[i] = nodeDescription.nodes[i];
			// reverse sort stateNode's children
			if(type == "MetStateNode")
				subMetNodes.reverse();
			// adjust scrollNode's children by scrollNode.contentOffset
			else if (type == "MetScrollNode") {
				var direction = nodeDescription.scrollDirection;
				var contentOffset = nodeDescription.contentOffset;
				for (var i in subMetNodes) {
					var node = subMetNodes[i];
					if (direction == 0)
						node.positionY -= contentOffset;
					else
						node.positionX -= contentOffset;
				}
				var footprints = nodeDescription.footprints;
				for (var i in footprints) {
					var ft = footprints[i];
					if (direction == 0)
						ft.f -= contentOffset;
					else
						ft.f -= contentOffset;
				}
			}
			var curMetPosZ = zPosition;
			for (var i in subMetNodes) {
				var newSubNode = this.makeMetNode(subMetNodes[i], size, curMetPosZ);
				newNode.addSubMetNode(newSubNode.metNode, newSubNode.zPos);
				curMetPosZ = newSubNode.zPos;
			}

			this.metNodesFromFactory[metNodeId] = newNode;

			newNode.setPositionPixels(posX, posY);

			return {metNode: newNode, zPos: curMetPosZ};
		},
		getMetNode: function (metNodeId) {
			return this.metNodesFromFactory[metNodeId];
		},
        IsPC:function () {
            var userAgentInfo = navigator.userAgent;
            var Agents = ["Android", "iPhone",
                "SymbianOS", "Windows Phone",
                "iPad", "iPod"];
            var flag = true;
            for (var v = 0; v < Agents.length; v++) {
                if (userAgentInfo.indexOf(Agents[v]) > 0) {
                    flag = false;
                    break;
                }
            }
            return flag;
        }
	}

	function setJPath(context, jpath) {
		context.beginPath();
		for (var jpathcmd in jpath) {
			var value = jpath[jpathcmd];

			//close path
			if (value === "X") {
				break;
			}

			var cmd = value.split(" ");
			var op = cmd[0];
			if (op === "M") {
				context.moveTo(Math.round(cmd[1]), Math.round(cmd[2]));
			}
			if (op === "L") {
				context.lineTo(Math.round(cmd[1]), Math.round(cmd[2]));
			}
			if (op === "C") {
				context.bezierCurveTo(Math.round(cmd[1]), Math.round(cmd[2]),
					Math.round(cmd[3]), Math.round(cmd[4]),
					Math.round(cmd[5]), Math.round(cmd[6]));
			}

		}
		context.closePath();
	}

	module.exports = MetNodeFactory;
});
