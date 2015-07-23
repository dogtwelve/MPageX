/* globals define */
define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Utility = require('famous/utilities/Utility');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var Easing = require('famous/transitions/Easing');
    var MetLightbox = require("container/MetLightbox");

    var StageView = require('views/StageView');
    var Director = require('tools/Director');
    var DebugUtils = require('utils/DebugUtils');

    var director = new Director();

    var dataContent = "dummy";

    var context = null;

    var project = {};
    var pages = {};
    var chapterPageIDs = {};
    var sectionPageIDs = {};
    // current index in chapters(level-1 pages)
    var currentChapter = window._initChapter || 0;
    // current index in sections(level-2 pages)
    var currentSection = window._initSection || 0;

    function _synthesizeLightBoxOptions(transition, page_size){
        var options = {
            inOpacity: 1,
            outOpacity: 1,
            inOrigin: [0.5, 0.5],
            outOrigin: [0.5, 0.5],
            showOrigin: [0.5, 0.5],
            inTransform: Transform.identity,
            outTransform: Transform.identity,
            inTransition: {duration: 500, curve: Easing.inQuad},
            outTransition: {duration: 500, curve: Easing.outQuad},
        }
        // 无 - MetStateNodeContentSlidingStyleNone
        if(transition === 0)
            ;
        // 渐变 - MetStateNodeContentSlidingStyleFade
        else if(transition === 1) {
            options.inOpacity = 1;
            options.outOpacity = 0;
        }
        // 纵向吸附 - MetStateNodeContentSlidingStyleStickVertSlide
        else if(transition === 2) {
            options.inTransform = Transform.translate(0, page_size[1], 0);
            options.outTransform = Transform.translate(0, -page_size[1], 0);
        }
        // 横向吸附 - MetStateNodeContentSlidingStyleStickHorizSlide
        else if(transition === 3) {
            options.inTransform = Transform.translate(page_size[0], 0, 0);
            options.outTransform = Transform.translate(-page_size[0], 0, 0);
        }
        // 3D翻转X - MetStateNodeContentSlidingStyleRotationX
        else if(transition === 4) {
            options.inTransform = Transform.rotateX(-Math.PI/2);
            options.outTransform = Transform.rotateX(Math.PI/2);
        }
        // 3D翻转Y - MetStateNodeContentSlidingStyleRotationY
        else if(transition === 5){
            options.inTransform = Transform.rotateY(-Math.PI/2);
            options.outTransform = Transform.rotateY(Math.PI/2);
        }
        // 缩放 - MetStateNodeContentSlidingStyleZoom
        else if(transition === 6) {
            options.inTransform = Transform.scale(0.001, 0.001, 1);
            options.outTransform = Transform.scale(0.001, 0.001, 1);
        }
        // 弹出 - MetStateNodeContentSlidingStyleBounce
        else if(transition === 7) {
            options.inTransform = Transform.scale(0.001, 0.001, 1);
            options.outTransform = Transform.scale(0.001, 0.001, 1);
            options.inTransition = {duration: 500, curve: Easing.outBack};
            options.outTransition = {duration: 500, curve: Easing.inBack};
        }
        // 飞驰 - MetStateNodeContentSlidingStyleFly
        else if(transition === 8) {
            options.inTransform = Transform.identity;
            options.outTransform = Transform.translate(0, page_size[1], 0);
        }
        // 交换 - MetStateNodeContentSlidingStyleSwitch
        else if(transition === 9) {
            options.inTransform = Transform.scale(0, 0, 1);
            options.outTransform = Transform.scale(0, 0, 1);
        }
        // 覆盖 - MetStateNodeContentSlidingStyleSync
        else if(transition === 10) {
            options.inTransform = Transform.scale(0, 0, 1);
            options.outTransform = Transform.scale(0, 0, 1);
        }

        return options;
    }
    var renderController = new MetLightbox(_synthesizeLightBoxOptions(0, [0, 0]));

    function __resizeMetView(){
        var contextContainer = document.getElementById("met-view");
        //TODO: i would do this in CSS, and not call _resize on contextContainer
        //_resize(contextContainer, origW, origH);
        contextContainer.style.width = window.innerWidth + "px";
        contextContainer.style.height = window.innerHeight + "px";
        contextContainer.overflow = "hidden";
        contextContainer.style.background="black";
        return contextContainer;
    }

    function _resize(){
        __resizeMetView();
    }

    function _init(){
        var contextContainer = __resizeMetView();

        //create the new one
        context = Engine.createContext(contextContainer);
        context.setPerspective(3000);

        Engine.on("resize",
            function() {
                _resize();
                Utility.loadURL("zres/project.json", initApp);
            }
        );
        Engine.on("orientationchange",
            function(){
                _resize();
                Utility.loadURL("zres/project.json", initApp);
            }
        );
    }

	function _getPageAt(chapter, section){
		var pageID = chapterPageIDs[chapter];
		if(section > 0)
			pageID = sectionPageIDs[chapter][section - 1];
		return pages[pageID];
	}

    function _updateChaptersLoading(current, total) {
        // TODO: show loading animation during chapters loading?
        if (current >= total) {
            // begin loading sections after chapters loading finished
            _loadSections();
        }
    }

    function _loadChapters(arr){
        var current = 0;
        var total = arr.length;
        if(current >= total)
            _updateChaptersLoading(current, total);
        else {
            for (var i in arr) {
                var exe = function () {
                    var pageID = chapterPageIDs[i] = arr[i];
                    sectionPageIDs[i] = {};
                    Utility.loadURL("zres/pages/" + pageID + ".json", function (page_data) {
                        var page_content = JSON.parse(page_data);
                        pages[pageID] = page_content;
                        current++;
                        _updateChaptersLoading(current, total);
                    }, true);
                };
                exe();
            }
        }
    }

    function _updateSectionsLoading(current, total) {
        // TODO: show loading animation during sections loading?
        if (current >= total) {
            _showPages();
        }
    }

    function _loadSections(){
        var arr = [];
        for(var j in chapterPageIDs) {
            var arr2 = pages[chapterPageIDs[j]].pageIDs || [];
            for(var i in arr2){
                var pageID = arr2[i];
                arr.push(pageID);
            }
        }
        var current = 0;
        var total = arr.length;
        // load sections
        if(current >= total)
            _updateSectionsLoading(current, total);
        else {
            for (var i in arr) {
                var exe = function () {
                    var pageID = sectionPageIDs[j][i] = arr[i];
                    Utility.loadURL("zres/pages/" + pageID + ".json", function (page_data) {
                        var page_content = JSON.parse(page_data);
                        pages[pageID] = page_content;
                        current++;
                        _updateSectionsLoading(current, total);
                    }, true);
                };
                exe();
            }
        }
    }

    function _showPages(){
        var currentPage = _getPageAt(currentChapter, currentSection);
        var pageView = createPageView(currentPage);

        renderController.show(pageView, null, null);
    }

    function initApp(data){
        if(!data) return;

        project = JSON.parse(data);
        var arr = project.pageIDs || [];

		// asynscronized load chapters, will trigger a serials operation about loading pages
        _loadChapters(arr);

        Engine.on("click", function(e){
            currentChapter = (currentChapter + 1) % arr.length;
            var options = _synthesizeLightBoxOptions(3, [project.width, project.height]);
            renderController.setOptions(options);
            _showPages();
        });
    }

    function createPageView(page){
        if(!project || !page) return null;
        var vsize = context.getSize();
        var csize = [project.width, project.height];
        var psize = [page.width, page.height];

        var pageView = new StageView({
            pageId: page.id_,
            pageDesc: page,
            projSize: csize,
            pageSize: psize,
            containerSize: vsize,
        });
        director.populateStage(pageView, page.nodes);

        return pageView;
	}

    _init();
    // create the main context
    _resize();
    context.add(renderController);

    // TODO: show loading animation during project loading?
    Utility.loadURL("zres/project.json", initApp);
});
