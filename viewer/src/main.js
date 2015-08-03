/* globals define */
define(function(require, exports, module) {
	'use strict';
	// import dependencies
	var Engine = require('famous/core/Engine');
	var Utility = require('famous/utilities/Utility');

	var Surface = require('famous/core/Surface');
	var ImageSurface = require('famous/surfaces/ImageSurface');
	var MetLightbox = require("container/MetLightbox");

	var StageView = require('views/StageView');
	var Director = require('tools/Director');
	var TransitionUtils = require('utils/TransitionUtils');
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

	var renderController = new MetLightbox({});

	function __resizeMetView(){
		var contextContainer = document.getElementById("met-view");
		//TODO: i would do this in CSS, and not call _resize on contextContainer
		//_resize(contextContainer, origW, origH);
		contextContainer.style.width = window.innerWidth + "px";
		contextContainer.style.height = window.innerHeight + "px";
		contextContainer.overflow = "hidden";
		contextContainer.style.background = "black";
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
				var options = TransitionUtils.synthesizeLightBoxOptions(0, [0, 0], [0, 0]);
				renderController.setOptions(options);
				Utility.loadURL("zres/project.json", initApp);
			}
		);
		Engine.on("orientationchange",
			function(){
				_resize();
				var options = TransitionUtils.synthesizeLightBoxOptions(0, [0, 0], [0, 0]);
				renderController.setOptions(options);
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

	function _showPages(together){
		var currentPage = _getPageAt(currentChapter, currentSection);
		var pageView = createPageView(currentPage);
		if(!together)
			renderController.hide(null, null, function(){
				renderController.show(pageView, null, null);
			});
		else {
			renderController.hide(null, null, null);
			renderController.show(pageView, null, null);
		}
	}

	function initApp(data){
		if(!data) return;

		project = JSON.parse(data);
		var arr = project.pageIDs || [];

		// asynscronized load chapters, will trigger a serials operation about loading pages
		_loadChapters(arr);

		Engine.on("dblclick", function(e){
			var vsize = context.getSize();
			var csize = [project.width, project.height];
			var dims = StageView.getPageContainerDims(vsize[0], vsize[1], csize[0], csize[1]);

			currentChapter = (currentChapter + 1) % arr.length;
			var options = TransitionUtils.synthesizeLightBoxOptions(4, [dims[0], dims[1]], [1, 1]);
			renderController.setOptions(options);
			_showPages(options.together);
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
