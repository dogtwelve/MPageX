/* globals define */
define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Utility = require('famous/utilities/Utility');
    var Modifier      = require('famous/core/Modifier');
    var Transform     = require('famous/core/Transform');
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var ImageSurface  = require('famous/surfaces/ImageSurface');
    var Draggable = require('famous/modifiers/Draggable');
    var Scrollview = require("famous/views/Scrollview");
    var ContainerSurface = require("famous/surfaces/ContainerSurface");
    var StageView = require('views/StageView');
    var Director = require('tools/Director');
    var DebugUtils = require('utils/DebugUtils');

    var context = null;
    var appDims;

    function getAppDims(container, origW, origH){
        var scaleX = window.innerWidth / origW;
        var scaleY = window.innerHeight / origH;

        //here we are going to let the bottom of the screen be cut off to allow fit to more
        //devices
        var scale = Math.min(scaleX, scaleY);
        //var scale = 1;

        var appWidth = origW * scale;
        var appHeight = origH * scale;

        return [appWidth, appHeight, scale];
    }

    var modifier = new Modifier({
        origin: [0.5, 0],
        align: [0.5, 0]
    });

    function _resize(container, origW, origH){
        appDims = getAppDims(container, origW, origH);
        container.style.width = window.innerWidth + "px";
        container.style.height = window.innerHeight + "px";
        container.overflow = "hidden";
        container.style.background="black";

        //modifier.setTransform(Transform.scale(appDims[2], appDims[2], 1));
        modifier.sizeFrom([origW, undefined]);
        modifier.transformFrom(Transform.scale(appDims[2], appDims[2], 1));
    }

    function _init(origW, origH){
        var contextContainer = document.getElementById("met-view");
        //TODO: i would do this in CSS, and not call _resize on contextContainer
        _resize(contextContainer, origW, origH);

        //create the new one
        context = Engine.createContext(contextContainer);
        context.setPerspective(3000);

        Engine.on("resize", function(){_resize(contextContainer);});
        Engine.on("orientationchange", function(){_resize(contextContainer);});
    }

    function _loadApp(){

    }




    //var stageView = new StageView();
    var director = new Director();

    var dataContent = "dummy";

    var pages = {};

    function initApp(data) {
        // Check response
        if (!data) {
            return;
        }

        // Consume response
        var content =  JSON.parse(data);



        var page;

        //TODO:multi-type input json data
        if(content.class === "MetProjectPage") {
            page = content;
            pages[page.id_] = page;
        } else if(content instanceof Array) {
            for(var contentPage in content) {
                page = content[contentPage];
                pages[page.id_] = page;
            }
        } else {
            DebugUtils.log("current json data format is not supported!");
        }


        DebugUtils.log("dataContent:" +  dataContent);

        var max_page_width = page.width;

        var max_page_height = page.height;

        var subpage_counts = page.pageIDs.length;

        var pageView = new StageView({
            pageId:  page.id_,
            pageDesc: page,
            contextSize: [page.width, page.height]
        });

        director.populateStage(pageView, page.nodes);



        //context.add(modifier).add(pageView);




        ////var draggable = new Draggable();
        ////draggable.subscribe(pageView.scrollRecieverSurface);
        ////mainContext.add(originModifier).add(draggable).add(pageView);
        //
        var pageViews = [];

        pageViews.push(pageView);

        for(var subpageIdx = 0 ; subpageIdx < subpage_counts; subpageIdx ++ ) {
            var subpage = pages[page.pageIDs[subpageIdx]];
            var subpageView = new StageView({
                pageId:  page.id_,
                pageDesc: subpage,
                contextSize: [page.width, page.height]
            });

            director.populateStage(subpageView, subpage.nodes);
            pageViews.push(subpageView);

            max_page_height +=  subpage.height;
        }

        var scrollview = new Scrollview();
        scrollview.sequenceFrom(pageViews);

        //var contextSize = context.getSize();
        var draggable = new Draggable({
                xRange: [0, 0],
                yRange: [- (max_page_height - window.innerHeight), 0]
            }
        );

        for(var pageView in pageViews) {
            draggable.subscribe(pageViews[pageView].scrollRecieverSurface);
        }

        //var originScrollviewModifier = new Modifier({
        //    size:[max_page_width, max_page_height],
        //    origin: [0.5, 0],
        //    align: [0.5, 0]
        //});

        // create the main context
        _init(max_page_width, max_page_height);
        context.add(modifier).add(draggable).add(scrollview);
    }

    Utility.loadURL("dataValue.json", initApp);


    //director.populateStageNew(stageView, nodeDescriptions, actionDescriptions);
    //
    //mainContext.add(stageView);
});
