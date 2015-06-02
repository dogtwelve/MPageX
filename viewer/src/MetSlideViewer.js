/* globals define */
define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Transform = require('famous/core/Transform');
    var Utility = require('famous/utilities/Utility');
    var Modifier = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Draggable = require('famous/modifiers/Draggable');
    var Scrollview = require("famous/views/Scrollview");
    var ContainerSurface = require("famous/surfaces/ContainerSurface");
    var StageView = require('views/StageView');
    var Director = require('tools/Director');
    var DebugUtils = require('utils/DebugUtils');
    function MetSlideViewer() {

    }
    MetSlideViewer.resetEditor = function(contextContainerId, pageData) {

        // create the main context
        var contextContainer = document.getElementById(contextContainerId);

        //create the new one
        var mainContext = Engine.createContext(contextContainer);

        // your app here
        mainContext.setPerspective(1000);

        //var stageView = new StageView();
        var director = new Director();

        var dataContent = "dummy";

        var pages = {};

        // Consume response
        var content =  pageData;



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
            //from the head page
            page = content[0];

        } else {
            var dataContent = content.pagesData;
            page = dataContent[0];
        }



        DebugUtils.log("dataContent:" +  dataContent);

        var max_page_width = page.width;

        var max_page_height = page.height;

        var subpage_counts = page.pageIDs.length;

        var pageView = new StageView({
            pageId:  page.id_,
            contextSize: [page.width, page.height],
            pageDesc: page
        });

        var originModifier = new Modifier({
            size:[max_page_width, max_page_height],
            origin: [0.5, 0],
            align: [0.5, 0]
        });

        director.populateStage(pageView, page.nodes);

        //mainContext.add(originModifier).add(pageView);




        //var draggable = new Draggable();
        //draggable.subscribe(pageView.scrollRecieverSurface);
        //mainContext.add(originModifier).add(draggable).add(pageView);

        var pageViews = [];

        pageViews.push(pageView);

        //for(var subpageIdx = 0 ; subpageIdx < subpage_counts; subpageIdx ++ ) {
        //    var subpage = pages[page.pageIDs[subpageIdx]];
        //    var subpageView = new StageView({
        //        pageId:  page.id_,
        //        contextSize: [page.width, page.height],
        //        pageDesc: subpage
        //    });

        //    director.populateStage(subpageView, subpage.nodes);
        //    pageViews.push(subpageView);

        //    max_page_height +=  subpage.height;
        //}

        var scrollview = new Scrollview();
        scrollview.sequenceFrom(pageViews);

        var contextSize = mainContext.getSize();
        var draggable = new Draggable({
                xRange: [0, 0],
                yRange: [- (max_page_height - contextSize[1]), 0]
            }
        );

        for(var pageView in pageViews) {
            draggable.subscribe(pageViews[pageView].scrollRecieverSurface);
        }

        var originScrollviewModifier = new StateModifier({
            size:[max_page_width, max_page_height],
            origin: [0.5, 0],
            align: [0.5, 0],
            transform: Transform.translate(0, 0, 0)
        });

        mainContext.add(originScrollviewModifier).add(draggable).add(scrollview);
    }

    module.exports = MetSlideViewer;

   
});
