/**
 * Created by sodemon on 2015/5/20.
 */
define(function (require, exports, module) {
    'use strict';
    var MetEventHandler = require('tools/MetEventHandler');
    var Timer = require("famous/utilities/Timer");
    var MetNodeFactory = require(['tools/MetNodeFactory'], function (m) {
        MetNodeFactory = m;
    });
    var Modifier = require('famous/core/Modifier');
    var Surface = require('famous/core/Surface');

    /** @constructor */
    function MetPerform() {
        // # 操作ID - global unique
        this.id_ = "";
        // # 执行方式
        // 类型 MetNodeActionPerformType
        this.performType = 0;
        // # 操作对象, 根据performType不同有不同的意义.
        this.targetID = "";
        // # 字符串执行参数, 根据performType不同有不同的使用方式.
        this.stringParam = "";
        // # 字符串执行参数, 根据performType不同有不同的使用方式.
        this.stringParam2 = "";
        // # 数字执行参数, 根据performType不同有不同的使用方式.
        this.longLongParam = 0;
    };

    // ------------------------------------------------------
    // 使用搭配: (performType, performParam1, performParam2)
    // ------------------------------------------------------
    // 空执行
    MetPerform.MetNodeActionPerformNone = 0;
    // 使用搭配: (performType, performParam1, performParam2)
    // 隐藏/解除隐藏hide/unhide, aNodeID, nil
    MetPerform.MetNodeActionPerformShowOrHideNode = 1;
    // 播放/暂停(animation|effect|video|autio|states) play/pause, anAnimationID, anEffectID, nil
    MetPerform.MetNodeActionPerformPlayStartOrStop = 2;
    // 状态跳转, aStateNodeID, state_index
    MetPerform.MetNodeActionPerformStateRedirect = 3;
    // 页面跳转, page_number, nil
    MetPerform.MetNodeActionPerformPageRedirect = 4;
    // 打开网⻚, url, nil
    MetPerform.MetNodeActionPerformOpenUrl = 5;
    // 打电话, phone_number, nil
    MetPerform.MetNodeActionPerformCall = 6;
    // 发邮件, email address, nil
    MetPerform.MetNodeActionPerformEmail = 7;
    // 编辑短信, default text, nil
    MetPerform.MetNodeActionPerformSMS = 8;
    // 保存图片, aNodeID, nil
    MetPerform.MetNodeActionPerformImageSave = 9;
    //摄像头，拍照替换shapenode填充的图片
    MetPerform.MetNodeActionPerformPageCamera = 10;
    //数据收集
    MetPerform.MetNodeActionPerformDataCollector = 11;

    MetPerform.prototype.parseByDic = function (dic) {
        this.id_ = dic.id_ || "";
        this.performType = dic.performType || 0;
        this.targetID = dic.targetID || "";
        this.stringParam = dic.stringParam || "";
        this.stringParam2 = dic.stringParam2 || "";
        this.longLongParam = dic.longLongParam || 0;
    };

    MetPerform.prototype.execute = function () {
        var nodeFactory = MetNodeFactory.sharedInstance();
        //将拍摄的照片绘制到画布
        function drawOnCanvas(file, canvas) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var dataURL = e.target.result,
                    c = canvas, // see Example 4
                    ctx = c.getContext('2d'),
                    img = new Image();

                img.onload = function () {
                    c.width = img.width;
                    c.height = img.height;
                    ctx.drawImage(img, 0, 0);
                };

                img.src = dataURL;
            };

            reader.readAsDataURL(file);
        }

        //将拍摄的照片绘制到背景
        function displayAsBackGroundImage(file, target) {
            var types = {'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'bmp': 'image/bmp'};
            var _type = file.type;
            // 如果没有文件类型，则通过后缀名判断（解决微信及360浏览器无法获取图片类型问题）
            if (!_type) {

                _type = types[file.name.match(/\.([^\.]+)$/i)[1]];
            }
            if (!/image.(png|jpg|jpeg|bmp)/.test(_type)) {
                return;
            }
            var reader = new FileReader();
            reader.onload = function () {
                // 头不带图片格式，需填写格式
                var re = /^data:base64,/;
                var ret = this.result + '';

                if (re.test(ret)) {
                    ret = ret.replace(re, 'data:' + types[_type] + ';base64,');
                }
                target.style.backgroundImage = "url(" + ret + ")";
            }
            reader.readAsDataURL(file);
        }

        // 空执行
        if (MetPerform.MetNodeActionPerformNone == this.performType)
            return;
        // 使用搭配: (performType, performParam1, performParam2)
        // 隐藏/解除隐藏hide/unhide, aNodeID, nil
        else if (MetPerform.MetNodeActionPerformShowOrHideNode == this.performType) {
            var nodeView = nodeFactory.getMetNode(this.targetID);
            if (!nodeView)
                ;
            else if (nodeView.isMetNodeShown())
                nodeView.hideMetNode();
            else
                nodeView.showMetNode();
        }
        // 播放/暂停(animation|video|autio|states) play/pause, aNodeID, nil
        else if (MetPerform.MetNodeActionPerformPlayStartOrStop == this.performType) {
            var nodeView = nodeFactory.getMetNode(this.targetID);
            if (!nodeView)
                ;
            else if (nodeView.type === "MetAnimNode") {
                var _keyframeAnim = nodeView.curKeyframeAnim;
                _keyframeAnim.isPause == true ? _keyframeAnim.resumeAnim() : _keyframeAnim.pauseAnim();
            }
            else if (nodeView.type === "VideoNode") {
                var video = document.getElementById("video-" + this.targetID);
                if (nodeView.mainSurface.videoPlay === true) {
                    video.pause();
                    nodeView.mainSurface.videoPlay = false;
                } else {
                    video.play();
                    nodeView.mainSurface.videoPlay = true;
                }
            }
            else if (nodeView.type === "AudioNode") {
                var video = document.getElementById("audio-" + this.targetID);
                if (nodeView.mainSurface.videoPlay === true) {
                    video.pause();
                    nodeView.mainSurface.videoPlay = false;
                } else {
                    video.play();
                    nodeView.mainSurface.videoPlay = true;
                }
            }
            else if (nodeView.type == "MetStateNode") {
                var curStateAnim = nodeView.curStateAnim;

                if (curStateAnim.animTimer) {
                    curStateAnim.stopPlay();
                } else {
                    curStateAnim.autoPlay();
                }
            }
        }
        // 状态跳转, aStateNodeID, state_index
        else if (MetPerform.MetNodeActionPerformStateRedirect == this.performType) {
            var nodeView = nodeFactory.getMetNode(this.targetID);

            if (!nodeView)
                ;
            else if (nodeView.type == "MetStateNode") {
                var curStateAnim = nodeView.curStateAnim;
                curStateAnim.curStateIdx = Number(this.longLongParam);
                curStateAnim.showState(false);
            }
        }
        // 页面跳转, page_number, nil
        else if (MetPerform.MetNodeActionPerformPageRedirect == this.performType) {

            var changePageHandler = MetEventHandler.getEventHandler("changePage");
            changePageHandler.emit("changePage", "8A219815-D40F-427A-89CC-EE981BCC6420");
        }
        // 打开网⻚, url, nil
        else if (MetPerform.MetNodeActionPerformOpenUrl == this.performType) {
            var url = this.stringParam;
            if (url != null && url.length > 0) {
                if (url.indexOf("http://") < 0) {
                    url = "http://" + url;
                }
                window.open(url, "_blank");
            }

        }
        // 打电话, phone_number, nil
        else if (MetPerform.MetNodeActionPerformCall == this.performType) {
            var phone_number = this.longLongParam;
            var nodeView = nodeFactory.getMetNode(this.targetID);
            var newModifier = new Modifier();
            var html = "<iframe style='width: 0px;height: 0px;border: 0px;' src='tel:" + phone_number + "'><" + "/iframe>";
            var newSurface = new Surface({content: html});
            nodeView.add(newModifier).add(newSurface);
        }
        // 发邮件, email address, nil
        else if (MetPerform.MetNodeActionPerformEmail == this.performType) {
            var email = this.stringParam;
            var nodeView = nodeFactory.getMetNode(this.targetID);
            var newModifier = new Modifier();
            var html = "<iframe style='width: 0px;height: 0px;border: 0px;' src='Mailto:" + email + "'><" + "/iframe>";
            var newSurface = new Surface({content: html});
            nodeView.add(newModifier).add(newSurface);
        }
        // 编辑短信, default text, nil
        else if (MetPerform.MetNodeActionPerformSMS == this.performType) {
            var phone_number = this.longLongParam;
            var nodeView = nodeFactory.getMetNode(this.targetID);
            var newModifier = new Modifier();
            var html = "<iframe style='width: 0px;height: 0px;border: 0px;' src='sms:" + phone_number + "'><" + "/iframe>";
            var newSurface = new Surface({content: html});
            nodeView.add(newModifier).add(newSurface);
        }
        // 保存图片, aNodeID, nil
        else if (MetPerform.MetNodeActionPerformImageSave == this.performType) {
            var nodeView = nodeFactory.getMetNode(this.targetID);
            if (!nodeView)
                ;
            else if (nodeView.type == "ShapeNode") {
            }
        }
        //摄像头，拍照替换shapenode填充的图片
        else if (MetPerform.MetNodeActionPerformPageCamera == this.performType) {
            var nodeView = nodeFactory.getMetNode(this.targetID);
            if (!nodeView)
                ;
            else if (nodeView.type == "ShapeNode") {
                var _camera = window.document.getElementById("camera");
                if (!_camera) {
                    var _camera = window.document.createElement("input");
                    _camera.id = "camera";
                    _camera.type = "file";
                    _camera.accept = "image/*";
                    _camera.addEventListener("change", function (e) {
                        var file = e.target.files[0];
                        var _target = nodeView.mainSurface._currentTarget;//.style.backgroundImage="url()";
                        displayAsBackGroundImage(file, _target);
                    }, false);
                    window.document.body.appendChild(_camera);
                }
                _camera.click();
            }
        }
        //数据收集, aDataCollectorID
        else if (MetPerform.MetNodeActionPerformDataCollector == this.performType) {
            var nodeView = nodeFactory.getMetNode(this.targetID);
            if (!nodeView)
                ;
            else if (nodeView.type == "MetDataCollectorNode") {

            }
        }
        else
            console.log("wrong perform!! LOL!!!");
    }

    module.exports = MetPerform;
});