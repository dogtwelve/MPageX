define(function(require, exports, module) {
    'use strict';
    var Engine        = require('famous/core/Engine');
    var Timer         = require('famous/utilities/Timer');
    var Transform           = require('famous/core/Transform');
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var Modifier      = require('famous/core/Modifier');

    var ImageSurface  = require('famous/surfaces/ImageSurface');

    var GenericSync   = require('famous/inputs/GenericSync');
    var MouseSync     = require('famous/inputs/MouseSync');
    var TouchSync     = require('famous/inputs/TouchSync');
    var ScrollSync    = require('famous/inputs/ScrollSync');

    var MetScrollview = require('container/MetScrollview');
    var RenderNode = require('famous/core/RenderNode');

    var UnitConverter = require('tools/UnitConverter');
    var DebugUtils = require('utils/DebugUtils');
    var TextUtils = require('utils/TextUtils');

    GenericSync.register({
        'mouse': MouseSync,
        'touch': TouchSync,
        'scroll': ScrollSync
    });

    function StageView() {
        View.apply(this, arguments);
        this.worldScrollValue = 0;
        this.pageId = this.options.pageId;
        this._arrowData = this.options.arrowData;
        this.pageDesc = this.options.pageDesc;
        this.projSize = this.options.projSize;
        this.pageSize = this.options.pageSize;
        this.containerSize = this.options.containerSize;

        var pageContainerDims = StageView.getPageContainerDims(this.containerSize[0], this.containerSize[1], this.projSize[0], this.projSize[1]);
        var pageContentDims = StageView.getPageContentDims(pageContainerDims[0], pageContainerDims[1], this.pageSize[0], this.pageSize[1]);

        _setupStageContainerSurface.call(this, pageContainerDims);
        _initRootNode.call(this, pageContainerDims, pageContentDims);
        //_handleScroll.call(this);
        //_handleSwipe.call(this);
        //_setupArrowKeyBreakpoints.call(this, 16, 60);
    }

    StageView.DEFAULT_OPTIONS = {
        velThreshold: 0.75,
        arrowData: {
            breakpoints: [0],
            speed: 4,
            step: 10
        },
        //projSize: [window.innerWidth, window.innerHeight]
    };

    StageView.prototype = Object.create(View.prototype);
    StageView.prototype.constructor = StageView;

    StageView.prototype.addMetNode = function(newNode) {
        newNode.initMetSubNode([/*this.syncScroll, this.syncSwipe*/], this.rootNode);
        _subscribeEvent(this, newNode);
        //newNode.activate(this.syncSwipe);
        //newNode.subscribe(this._eventOutput);
        //this.add(newNode);
    };

    StageView.prototype.updateArrowKeyBreakpoints = function(newBreakpoints) {
        newBreakpoints = newBreakpoints.sort(function(a,b) {
            return a - b;
        });

        if (newBreakpoints[0] !== 0) {
            newBreakpoints = [0].concat(newBreakpoints);
        }

        this._arrowData.breakpoints = newBreakpoints;
    };

    function _setupStageContainerSurface(pageContainerDims) {
        ////单色填充
        var METCOLORFILLTYPE = 0;
        ////渐变填充
        var METGRADIENTFILLTYPE = 1;
        ////图片填充
        var METIMAGEFILLTYPE = 2;
        ////无填充
        var METNONEFILLTYPE = 3;

        var classes = ['z1'];

        var containerSize = this.containerSize;
        this.stageContainerSurface = new ContainerSurface({
            size: [pageContainerDims[0], pageContainerDims[1]],
            classes: classes,
            properties :{
                overflow: "hidden",
                backgroundColor: "white",
            }
        });
        var pageScale = pageContainerDims[2];

        if(this.pageDesc.fillType == METCOLORFILLTYPE) {
            var fillColor = UnitConverter.rgba2ColorString(this.pageDesc.colorFill.fillColor);
            this.stageContainerSurface.setProperties({backgroundColor: fillColor});
        }
        else if(this.pageDesc.fillType == METGRADIENTFILLTYPE) {
            var gf = this.pageDesc.gradientFill;
            //{-888, 888}
            var start_point = gf.startPoint;
            {
                start_point = start_point.replace(/[\{\}]/g, "");
                start_point = start_point.split(",");
                if(!ir instanceof Array)
                    start_point = [0, 0];
                else
                    for(var i = 0; i < start_point.length; i++) start_point[i] = Number(start_point[i]) * pageScale;
            }
            //{-888, 888}
            var end_point = gf.endPoint;
            {
                end_point = end_point.replace(/[\{\}]/g, "");
                end_point = end_point.split(",");
                if(!ir instanceof Array)
                    end_point = [0, 0];
                else
                    for(var i = 0; i < end_point.length; i++) end_point[i] = Number(end_point[i]) * pageScale;
            }
            // sort gradientPoints's copy
            var gps = [];
            for(var i = 0; i < gf.gradientPoints.length; i++) {
                var gp = gf.gradientPoints[i];
                gps.push(gp);
            }
            gps.sort(function(obj1, obj2){
                if(obj1.location > obj2.location)
                    return 1;
                else if(obj1.location < obj2.location)
                    return -1;
            });
            var bg_style = null;
            if(gf.gradientType == 0)
                bg_style = TextUtils.sprintf("%sgradient(linear, %d %d, %d %d", DebugUtils.browserPrefixes().css, start_point[0], start_point[1], end_point[0], end_point[1]);
            else {
                bg_style = TextUtils.sprintf("%sgradient(radial, %d %d, 0, %d %d, %d", DebugUtils.browserPrefixes().css, start_point[0], start_point[1], end_point[0], end_point[1], Math.max(pageContainerDims[0], pageContainerDims[1]));
            }
            for(var i = 0; i < gps.length; i++){
                var gp = gps[i];
                var color = UnitConverter.rgba2ColorString(gp.color);
                if(i == 0)
                    bg_style += ", from(" + color + ")";
                else if(i == gps.length - 1)
                    bg_style += ", to(" + color + "))";
                else
                    bg_style += TextUtils.sprintf(", color-stop(%f, %s)", gp.location, color);
            }
            this.stageContainerSurface.setProperties({background: bg_style,});
        }
        else if(this.pageDesc.fillType == METIMAGEFILLTYPE) {
            var fillImage = this.pageDesc.imageFill.rawImageURL;
            // get imageRect
            //"imageRect" : "{{-850.35943603515625, -0.00079511082731187344}, {1616.3837890625, 1048.1239013671875}}",
            var ir = this.pageDesc.imageFill.imageRect;
            ir = ir.replace(/[\{\}]/g, "");
            ir = ir.split(",");
            if(!ir instanceof Array)
                ir = [0, 0, size[0] * pageScale, size[1] * pageScale];
            else
                for(var i = 0; i < ir.length; i++) ir[i] = Number(ir[i]) * pageScale;

            this.stageContainerSurface.setProperties({
                backgroundImage: TextUtils.sprintf("url('zres/%s')", this.pageDesc.imageFill.rawImageURL),
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "relative",
                backgroundPosition: TextUtils.sprintf("%dpx %dpx", ir[0], ir[1]),
                backgroundSize: TextUtils.sprintf("%dpx %dpx", ir[2], ir[3]),
                backgroundColor: 'black',
            });
        }

        var modifier = new Modifier({
            align: [0.5, 0.5],
        });

        this.add(modifier).add(this.stageContainerSurface);
        this._eventOutput.subscribe(this.stageContainerSurface);

        this.on('click', function(data) {
            DebugUtils.log(this.pageId + " type =  stage view event click");
        }.bind(this));
    }

    function _initRootNode(pageContainerDims, pageContentDims) {
        var classes = ['z2'];

        var rootModifier = new Modifier({
            size: this.pageSize,
            origin: [0.5, 0],
            align: [0.5, 0],
            transform: Transform.scale(pageContentDims[2], pageContentDims[2], 1),
        });

        var renderNode = new RenderNode();

        var scrollView = new MetScrollview({paginated: false});
        scrollView.sequenceFrom([renderNode]);
        scrollView.subscribe(this.stageContainerSurface);

        this.stageContainerSurface.add(scrollView);
        this.rootNode = renderNode.add(rootModifier);
    }

    StageView.getPageContainerDims = function(viewportW, viewportH, origW, origH){
        var scaleX = viewportW / origW;
        var scaleY = viewportH / origH;

        //here we are going to let the bottom of the screen be cut off to allow fit to more
        //devices
        var scale = Math.min(scaleX, scaleY);
        return [origW * scale, origH * scale, scale];
    }

    StageView.getPageContentDims = function(containerW, containerH, origW, origH){
        var scale = containerW / origW;
        return [origW * scale, origH * scale, scale];
    }

    function _subscribeEvent(subscriber, src) {
        subscriber.subscribe(src);
    }

    //function _handleScroll() {
    //    this.syncScroll = new GenericSync(
    //        ['touch', 'scroll'],
    //        {direction: GenericSync.DIRECTION_Y}
    //    );
    //
    //    this.stageContainerSurface.pipe(this.syncScroll);
    //
    //    this.syncScroll.on('update', function(data) {
    //        // Invert delta so scrolling up is positive.
    //        this.worldScrollValue -= data.delta;
    //        _emitScrollUpdate.call(this, data.delta);
    //    }.bind(this));
    //
    //    this.syncScroll.on('end', function(data) {
    //    }.bind(this));
    //}
    //
    //function _handleSwipe() {
    //    this.syncSwipe = new GenericSync(
    //        ['mouse', 'touch'],
    //        {direction : GenericSync.DIRECTION_X}
    //    );
    //
    //    this.scrollRecieverSurface.pipe(this.syncSwipe);
    //
    //    this.syncSwipe.on('update', function(data) {
    //        //var currentPosition = this.pageViewPos.get();
    //        //if(currentPosition === 0 && data.velocity > 0) {
    //        //    this.menuView.animateStrips();
    //        //}
    //        //
    //        //this.pageViewPos.set(Math.max(0, currentPosition + data.delta));
    //    }.bind(this));
    //
    //    this.syncSwipe.on('end', (function(data) {
    //        var velocity = data.velocity;
    //        //var position = this.pageViewPos.get();
    //        //
    //        //if(this.pageViewPos.get() > this.options.posThreshold) {
    //        //    if(velocity < -this.options.velThreshold) {
    //        //        this.slideLeft();
    //        //    } else {
    //        //        this.slideRight();
    //        //    }
    //        //} else {
    //        //    if(velocity > this.options.velThreshold) {
    //        //        this.slideRight();
    //        //    } else {
    //        //        this.slideLeft();
    //        //    }
    //        //}
    //
    //        if(velocity < 0 && velocity < -this.options.velThreshold) {
    //            _onForwardOrBackward.call(this, 'forward');
    //            DebugUtils.log("syncSwipe forward:" + velocity);
    //        } else if(velocity > 0 && velocity > this.options.velThreshold){
    //            _onForwardOrBackward.call(this, 'reverse');
    //            DebugUtils.log("syncSwipe backward:" + velocity);
    //        }
    //    }).bind(this));
    //}
    //
    //function _emitScrollUpdate(delta) {
    //    this._eventOutput.emit('ScrollUpdated', {delta: -delta});
    //}
    //
    //function _onForwardOrBackward(direction) {
    //    // If movement is already in progress, cancel interval
    //    if (this._arrowData.interval) {
    //        Timer.clear(this._arrowData.interval);
    //        delete this._arrowData.interval;
    //    }
    //    // Set next lowest breakpoint
    //    var nextBreakpoint = getNextScrollPoint.call(this, direction);
    //
    //
    //
    //    this._arrowData.interval = Timer.setInterval(function() {
    //        if ((direction === 'reverse' && this.worldScrollValue <= nextBreakpoint) ||
    //            (direction === 'forward' && this.worldScrollValue >= nextBreakpoint)) {
    //            Timer.clear(this._arrowData.interval);
    //            delete this._arrowData.interval;
    //        } else {
    //            if (direction === 'forward' ? this.worldScrollValue < nextBreakpoint : this.worldScrollValue > nextBreakpoint) {
    //                var currentStep = Math.min(this._arrowData.step, direction === 'forward' ? nextBreakpoint - this.worldScrollValue : this.worldScrollValue - nextBreakpoint);
    //                currentStep = direction === 'forward' ? -currentStep : currentStep;
    //                this.worldScrollValue -= currentStep;
    //                _emitScrollUpdate.call(this, currentStep);
    //            } else {
    //                Timer.clear(this._arrowData.interval);
    //                delete this._arrowData.interval;
    //            }
    //        }
    //    }.bind(this), this._arrowData.speed);
    //
    //    // Function assumes that the breakboards are sorted lowest to highest.
    //    function getNextScrollPoint(searchDirection) {
    //        searchDirection = searchDirection ? searchDirection : 'forward';
    //
    //        var searchBreakpoints = this._arrowData.breakpoints;
    //        var nextScrollPoint; //init undefined
    //
    //        if (searchDirection !== 'forward') {
    //            searchBreakpoints = searchBreakpoints.slice(0).reverse(); //copy array so we don't mutate the original with the reverse;
    //        }
    //
    //        for (var i = 0; i < searchBreakpoints.length; i++) {
    //            if ((searchDirection === 'forward' && this.worldScrollValue < searchBreakpoints[i]) ||
    //                (searchDirection !== 'forward' && this.worldScrollValue > searchBreakpoints[i])) {
    //                nextScrollPoint = searchBreakpoints[i];
    //                break;
    //            }
    //        }
    //
    //        return nextScrollPoint;
    //    }
    //}
    //
    //function _setupArrowKeyBreakpoints(speed, step) {
    //    var leftArrowKeyCode = 37;
    //    var upArrowKeyCode = 38;
    //    var rightArrowKeyCode = 39;
    //    var downArrowKeyCode = 40;
    //
    //    this._arrowData.speed = speed || this._arrowData.speed;
    //    this._arrowData.step = step || this._arrowData.step;
    //
    //    var nextBreakpoint; //init undefined
    //
    //    Engine.on('keydown', function(e) {
    //        var direction;
    //
    //        //// If movement is already in progress, cancel interval
    //        //if (this._arrowData.interval) {
    //        //    Timer.clear(this._arrowData.interval);
    //        //    delete this._arrowData.interval;
    //        //}
    //
    //        // Arrow key selected
    //        if (e.keyCode === downArrowKeyCode || e.keyCode === leftArrowKeyCode ||
    //            e.keyCode === upArrowKeyCode || e.keyCode === rightArrowKeyCode) {
    //
    //            //Determine direction to move
    //            if (e.keyCode === downArrowKeyCode || e.keyCode === rightArrowKeyCode) {
    //                direction = 'forward';
    //            } else {
    //                direction = 'reverse';
    //            }
    //
    //            _onForwardOrBackward.call(this, direction);
    //
    //            //// Set next lowest breakpoint
    //            //nextBreakpoint = getNextScrollPoint.call(this, direction);
    //            //
    //            //this._arrowData.interval = Timer.setInterval(function() {
    //            //    if ((direction === 'reverse' && this.worldScrollValue <= nextBreakpoint) ||
    //            //        (direction === 'forward' && this.worldScrollValue >= nextBreakpoint)) {
    //            //        Timer.clear(this._arrowData.interval);
    //            //        delete this._arrowData.interval;
    //            //    } else {
    //            //        if (direction === 'forward' ? this.worldScrollValue < nextBreakpoint : this.worldScrollValue > nextBreakpoint) {
    //            //            var currentStep = Math.min(this._arrowData.step, direction === 'forward' ? nextBreakpoint - this.worldScrollValue : this.worldScrollValue - nextBreakpoint);
    //            //            currentStep = direction === 'forward' ? -currentStep : currentStep;
    //            //            this.worldScrollValue -= currentStep;
    //            //            _emitScrollUpdate.call(this, currentStep);
    //            //        } else {
    //            //            Timer.clear(this._arrowData.interval);
    //            //            delete this._arrowData.interval;
    //            //        }
    //            //    }
    //            //}.bind(this), this._arrowData.speed);
    //        }
    //
    //        //// Function assumes that the breakboards are sorted lowest to highest.
    //        //function getNextScrollPoint(searchDirection) {
    //        //    searchDirection = searchDirection ? searchDirection : 'forward';
    //        //
    //        //    var searchBreakpoints = this._arrowData.breakpoints;
    //        //    var nextScrollPoint; //init undefined
    //        //
    //        //    if (searchDirection !== 'forward') {
    //        //        searchBreakpoints = searchBreakpoints.slice(0).reverse(); //copy array so we don't mutate the original with the reverse;
    //        //    }
    //        //
    //        //    for (var i = 0; i < searchBreakpoints.length; i++) {
    //        //        if ((searchDirection === 'forward' && this.worldScrollValue < searchBreakpoints[i]) ||
    //        //            (searchDirection !== 'forward' && this.worldScrollValue > searchBreakpoints[i])) {
    //        //            nextScrollPoint = searchBreakpoints[i];
    //        //            break;
    //        //        }
    //        //    }
    //        //
    //        //    return nextScrollPoint;
    //        //}
    //    }.bind(this));
    //}

    module.exports = StageView;
});
