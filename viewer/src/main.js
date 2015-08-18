define(function(require, exports, module) {
	'use strict';
	// import dependencies
	var Engine = require('famous/core/Engine');
	var Utility = require('famous/utilities/Utility');
    var MetEventHandler = require('tools/MetEventHandler');
	var RenderNode = require('famous/core/RenderNode');
	var Surface = require('famous/core/Surface');
	var ImageSurface = require('famous/surfaces/ImageSurface');
	var RenderController = require('famous/views/RenderController');
	var MetLightbox = require("container/MetLightbox");
	var OverlayView = require('views/OverlayView');
	var StageView = require('views/StageView');
	var Director = require('tools/Director');
	var Transform = require('famous/core/Transform');
	var TransformUtils = require('utils/TransformUtils');
	var TransitionUtils = require('utils/TransitionUtils');
	var DebugUtils = require('utils/DebugUtils');

	var director = new Director();

	var dataContent = "dummy";

	var context = null;

	var project = {};
	var pages = {};
	var overlaps = {};
	var chapterPageIDs = [];
	var sectionPageIDs = [];
	// current index in chapters(level-1 pages)
	var currentChapter = window._initChapter || 0;
	// current index in sections(level-2 pages)
	var currentSection = window._initSection || 0;

	// 0: vertical gesture, 1: horrizontal gesture
	var chapterChangeDirection = 0;
	// 0: vertical gesture, 1: horrizontal gesture
	var sectionChangeDirection = 0;

	var renderController = new MetLightbox({});
	var overlayController = new RenderNode();
	function __resizeMetView() {
        var contextContainer = document.getElementById("met-view");
        var width = window.innerWidth + "px";
        var height = window.innerHeight + "px";
        if (width != contextContainer.style.width || height != contextContainer.style.height) {
            contextContainer.style.width = width;
            contextContainer.style.height = height;
            contextContainer.overflow = "hidden";
        }
        else {
            contextContainer.style.margin = "auto";
        }
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
        MetEventHandler.addEventHandler("changePage",function(data){
            var location = _getChapterAndSection(data);
            currentChapter = location.chapter;
            currentSection = location.section;
            _showPages();
        })

	}

	function _getPageAt(chapter, section){
		var pageID = chapterPageIDs[chapter];
		if(section > 0)
			pageID = sectionPageIDs[chapter][section - 1];
		return pages[pageID];
	}

    //根据pageID获取章节位置
    function _getChapterAndSection(pageID){
        var data = {"chapter":0,"section":0};
        var chapterCount = chapterPageIDs.length;
        for(var i =0;i<chapterCount;i++){
            if(pageID ==chapterPageIDs[i]){
                data.chapter = i;
                break;
            }
            var isOk = false;
            var sectionCount=sectionPageIDs[i].length;
            for(var j=0;j<sectionCount;j++){
                if(pageID ==chapterPageIDs[j]){
                    data.chapter = i;
                    data.section = j;
                    isOk = true;
                    break;
                }
            }
            if(isOk){
                break;
            }
        }
        return data;
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
					sectionPageIDs[i] = [];
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

	function _showPages() {
        var currentPage = _getPageAt(currentChapter, currentSection);
        var pageView = createPageView(currentPage);
        renderController.hide(null, null, function () {
            renderController.show(pageView, null, null);
        });

        _setupPageEventHandling(pageView);
    }

    function _setupPageEventHandling(pageView) {
        var curr_pageView = pageView;
        var vsize = context.getSize();
        var csize = [project.width, project.height];

        var pageScale = StageView.getPageContainerScale(vsize[0], vsize[1], csize[0], csize[1]);

        // event handling
        var fromPos = null;
        // 0: vertical, 1: horrizontal, null: nothing
        var gestureDirection = null;
        var gestureTransition = null;
        // 保存潜在将进入的页面, 目前实现方式是在手势换页期间, 保有这两个页面, 在换页操作完成后, 再释放掉这两个页面
        var prev_pageView = null, next_pageView = null;
        // down
        var _on_down = function (e) {
            e.preventDefault();
            if (renderController.renderables.length > 1) return;
            fromPos = [e.clientX || e.changedTouches[0].clientX, e.clientY || e.changedTouches[0].clientY];
        };
        // move
        var _on_move = function (e) {
            e.preventDefault();
            if (null == fromPos) return;
            var toPos = [e.clientX || e.changedTouches[0].clientX, e.clientY || e.changedTouches[0].clientY];
            var delta = [toPos[0] - fromPos[0], toPos[1] - fromPos[1]];
            // 移动足够多距离16px, 开始判断手势方向
            var gestureJustRecornized = false;
            if (null == gestureDirection) {
                if (Math.abs(delta[0]) + Math.abs(delta[1]) > 16) {
                    if (Math.abs(delta[1]) > Math.abs(delta[0])) {
                        if (chapterChangeDirection == 0 || sectionChangeDirection == 0)
                            gestureDirection = 0;
                    }
                    else {
                        if (chapterChangeDirection == 1 || sectionChangeDirection == 1)
                            gestureDirection = 1;
                    }
                }
                if (null != gestureDirection)
                    gestureJustRecornized = true;
            }

            // 手势方向判断完成之前, 不做任何影响
            if (null == gestureDirection)
                return;

            // 对于垂直方向的操作, 只有页面的内容滚动到了边缘, 才可能触发换章节
            if (0 == gestureDirection) {
                if (!curr_pageView.scrollView.isOnTopEdge() && !curr_pageView.scrollView.isOnBottomEdge()) {
                    fromPos = toPos;
                    return;
                }
            }

            if (null == gestureTransition && sectionChangeDirection == gestureDirection) {
                if (_canShowPagesByOffset(0, (delta[1 - gestureDirection] > 0) ? -1 : 1))
                    gestureTransition = project.grade2TransitionStyle;
            }
            if (null == gestureTransition && chapterChangeDirection == gestureDirection) {
                if (_canShowPagesByOffset((delta[1 - gestureDirection] > 0) ? -1 : 1, 0))
                    gestureTransition = project.grade1TransitionStyle;
            }

            if (null == gestureTransition)
                return;
            // 无 - MetStateNodeContentSlidingStyleNone
            if (gestureTransition === 0)
                return;

            var vsz = curr_pageView.stageContainerSurface.getSize();
            vsz = [vsz[0] * pageScale, vsz[1] * pageScale];
            var t = Math.max(-1, Math.min(1, delta[1 - gestureDirection] / vsz[1 - gestureDirection]));

            // 准备相邻页面
            if (gestureJustRecornized) {
                if (sectionChangeDirection == gestureDirection) {
                    if (_canShowPagesByOffset(0, -1))
                        prev_pageView = createPageView(_getPageAt(currentChapter, currentSection - 1));
                    else if (chapterChangeDirection == gestureDirection) {
                        if (_canShowPagesByOffset(-1, 0))
                            prev_pageView = createPageView(_getPageAt(currentChapter - 1, 0));
                    }

                    if (_canShowPagesByOffset(0, 1))
                        next_pageView = createPageView(_getPageAt(currentChapter, currentSection + 1));
                    else if (chapterChangeDirection == gestureDirection) {
                        if (_canShowPagesByOffset(1, 0))
                            next_pageView = createPageView(_getPageAt(currentChapter + 1, 0));
                    }
                }
                else if (chapterChangeDirection == gestureDirection) {
                    if (_canShowPagesByOffset(-1, 0))
                        prev_pageView = createPageView(_getPageAt(currentChapter - 1, 0));
                    if (_canShowPagesByOffset(1, 0))
                        next_pageView = createPageView(_getPageAt(currentChapter + 1, 0));
                }
            }

            // prev
            if (null != prev_pageView) {
                var already_shown = (renderController.stateItem4Renderable(prev_pageView) != null);
                var prev_options = TransitionUtils.synthesizeAnimateOptions(gestureTransition, t, -1, vsz, [gestureDirection, 1 - gestureDirection]);
                var should_show = prev_options.visible;
                var zIndex = prev_options.zIndex;
                if (should_show) {
                    if (!already_shown) {
                        renderController.addRenderable(prev_pageView, prev_options);
                        already_shown = true;
                    }
                }
                else {
                    if (already_shown) {
                        renderController.removeRenderable(prev_pageView);
                        already_shown = false;
                    }
                }
                if (already_shown) {
                    renderController.modifyRenderableWithOptions(prev_pageView, prev_options);
                    prev_pageView.stageContainerSurface.setProperties({zIndex: zIndex});
                }
            }
            // next
            if (null != next_pageView) {
                var already_shown = (renderController.stateItem4Renderable(next_pageView) != null);
                var next_options = TransitionUtils.synthesizeAnimateOptions(gestureTransition, t, +1, vsz, [gestureDirection, 1 - gestureDirection]);
                var should_show = next_options.visible;
                var zIndex = next_options.zIndex;
                if (should_show) {
                    if (!already_shown) {
                        renderController.addRenderable(next_pageView, next_options);
                        already_shown = true;
                    }
                }
                else {
                    if (already_shown) {
                        renderController.removeRenderable(next_pageView);
                        already_shown = false;
                    }
                }
                if (already_shown) {
                    renderController.modifyRenderableWithOptions(next_pageView, next_options);
                    next_pageView.stageContainerSurface.setProperties({zIndex: zIndex});
                }
            }
            // current
            {
                var already_shown = (renderController.stateItem4Renderable(curr_pageView) != null);
                var me_options = TransitionUtils.synthesizeAnimateOptions(gestureTransition, t, 0, vsz, [gestureDirection, 1 - gestureDirection]);
                var should_show = me_options.visible;
                var zIndex = me_options.zIndex;
                if (should_show) {
                    if (!already_shown) {
                        renderController.addRenderable(curr_pageView, me_options);
                        already_shown = true;
                    }
                }
                else {
                    if (already_shown) {
                        renderController.removeRenderable(curr_pageView);
                        already_shown = false;
                    }
                }
                if (already_shown) {
                    renderController.modifyRenderableWithOptions(curr_pageView, me_options);
                    curr_pageView.stageContainerSurface.setProperties({zIndex: zIndex});
                }
            }
        };
        // up
        var _on_up = function (e) {
            e.preventDefault();

            if (null == fromPos) return;
            var toPos = [e.clientX || e.changedTouches[0].clientX, e.clientY || e.changedTouches[0].clientY];
            var delta = [toPos[0] - fromPos[0], toPos[1] - fromPos[1]];
            fromPos = null;

            if (null == gestureDirection) return;

            var vsz = curr_pageView.stageContainerSurface.getSize();
            vsz = [vsz[0] * pageScale, vsz[1] * pageScale];

            // 三个页面中, 需要留下来的, 作为第一个参数winner. 另外两个则分别为loser1, loser2
            var __pageChangeCommit = function (winner, loser1, loser2, t0, off0, t1, off1, t2, off2, transition) {
                // 为新的页面设置同样的事件处理机制
                if (null != winner && winner != curr_pageView) {
                    var options = TransitionUtils.synthesizeLightBoxOptions(transition, vsz, [gestureDirection, 1 - gestureDirection]);
                    renderController.setOptions(options);

                    Engine.removeListener("mousedown", _on_down);
                    Engine.removeListener("touchstart", _on_down);
                    Engine.removeListener("mousemove", _on_move);
                    Engine.removeListener("touchmove", _on_move);
                    Engine.removeListener("touchcancel", _on_up);
                    Engine.removeListener("mouseup", _on_up);
                    Engine.removeListener("touchend", _on_up);

                    _setupPageEventHandling(winner);
                }

                // 提交页面改变
                var me_options = TransitionUtils.synthesizeAnimateOptions(gestureTransition, t0, off0, vsz, [gestureDirection, 1 - gestureDirection]);
                var l1_options = TransitionUtils.synthesizeAnimateOptions(gestureTransition, t1, off1, vsz, [gestureDirection, 1 - gestureDirection]);
                var l2_options = TransitionUtils.synthesizeAnimateOptions(gestureTransition, t2, off2, vsz, [gestureDirection, 1 - gestureDirection]);
                var options_rc = renderController.options;
                if (null == renderController.stateItem4Renderable(winner))
                    renderController.addRenderable(winner, null);
                renderController.animateRenderableWithFromToOptions(winner, options_rc.inTransition, null, me_options, function () {
                    renderController.removeRenderable(loser1);
                    renderController.removeRenderable(loser2);
                    winner.stageContainerSurface.setProperties({zIndex: 1});
                });
                renderController.animateRenderableWithFromToOptions(loser1, options_rc.inTransition, null, l1_options, null);
                renderController.animateRenderableWithFromToOptions(loser2, options_rc.inTransition, null, l2_options, null);
            };
            var changed = false;
            if (!changed && sectionChangeDirection == gestureDirection) {
                // prev section
                if (delta[1 - gestureDirection] > vsz[1 - gestureDirection] / 3) {
                    if (_canShowPagesByOffset(0, -1)) {
                        __pageChangeCommit(prev_pageView, curr_pageView, next_pageView, 1, -1, 1, 0, 1, 1, project.grade2TransitionStyle);
                        currentSection--;
                        changed = true;
                    }
                }
                // next section
                else if (delta[1 - gestureDirection] < -vsz[1 - gestureDirection] / 3) {
                    if (_canShowPagesByOffset(0, 1)) {
                        __pageChangeCommit(next_pageView, prev_pageView, curr_pageView, -1, 1, -1, -1, -1, 0, project.grade2TransitionStyle);
                        currentSection++;
                        changed = true;
                    }
                }
            }
            if (!changed && chapterChangeDirection == gestureDirection) {
                // prev chapter
                if (delta[1 - gestureDirection] > vsz[1 - gestureDirection] / 3) {
                    if (_canShowPagesByOffset(-1, 0)) {
                        __pageChangeCommit(prev_pageView, curr_pageView, next_pageView, 1, -1, 1, 0, 1, 1, project.grade1TransitionStyle);
                        currentChapter--;
                        currentSection = 0;
                        changed = true;
                    }
                }
                // next chapter
                else if (delta[1 - gestureDirection] < -vsz[1 - gestureDirection] / 3) {
                    if (_canShowPagesByOffset(1, 0)) {
                        __pageChangeCommit(next_pageView, prev_pageView, curr_pageView, -1, 1, -1, -1, -1, 0, project.grade1TransitionStyle);
                        currentChapter++;
                        currentSection = 0;
                        changed = true;
                    }
                }
            }
            if (!changed)
                __pageChangeCommit(curr_pageView, prev_pageView, next_pageView, 0, 0, 0, -1, 0, 1, null);

            prev_pageView = null;
            next_pageView = null;
            gestureDirection = null;
            gestureTransition = null;
        };
        Engine.on("mousedown", _on_down);
        Engine.on("touchstart", _on_down);
        Engine.on("mousemove", _on_move);
        Engine.on("touchmove", _on_move);
        Engine.on("touchcancel", _on_up);
        Engine.on("mouseup", _on_up);
        Engine.on("touchend", _on_up);
    }

    function _canShowPagesByOffset(chapter_off, section_off){
        if(chapter_off != 0) {
            var arr = chapterPageIDs;
            chapter_off = currentChapter + chapter_off;
            if(chapter_off < 0 || chapter_off > arr.length - 1)
                return false;
        }
        else if(section_off != 0){
            var arr = sectionPageIDs[currentChapter];

            section_off = currentSection + section_off;
            // here is Just arr.length, not need -1, because section 0 is chapter itself, section i is chapter.sections[i - 1]
            if(section_off < 0 || section_off > arr.length)
                return false;
        }
        else
            return false;
        return true;
    }

	function initApp(data){
		if(!data) return;

		project = JSON.parse(data);

		// 确定操作换章、换节的操作方向
		var _isDirectionTransition = function(t){
			return t == 2 || t == 3 || t == 4 || t == 5;
		};
		var _wanaDirection4Transition = function(t){
			return (t == 3 || t == 5) ? 1 : 0;
		};
		if(!_isDirectionTransition(project.grade1TransitionStyle))
			chapterChangeDirection = sectionChangeDirection = _wanaDirection4Transition(project.grade2TransitionStyle);
		else if(!_isDirectionTransition(project.grade2TransitionStyle))
			sectionChangeDirection = chapterChangeDirection = _wanaDirection4Transition(project.grade1TransitionStyle);
		else{
			chapterChangeDirection = _wanaDirection4Transition(project.grade1TransitionStyle);
			sectionChangeDirection = _wanaDirection4Transition(project.grade2TransitionStyle);
		}

		// asynscronized load chapters, will trigger a serials operation about loading pages
        var arr = project.pageIDs || [];
		_loadChapters(arr);
		var overlay = OverlayView({
			containerSize: context.getSize(),
			projSize: [project.width, project.height]
		})
		overlayController.add(overlay);
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
	context.add(overlayController);
	//overlayController.add(new Surface({
	//	size: [100,100],
	//	//content: name,
	//	classes: ['z2'],
	//		properties: {
	//			border: '1px dashed rgb(210, 208, 203)'
	//		}
	//}));

    // TODO: show loading animation during project loading?
    Utility.loadURL("zres/project.json", initApp);
});
