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

		this.stageContainerSurface = null;
		this.scrollView = null;

		_setupStageContainerSurface.call(this);
		_initRootNode.call(this);
	}

	StageView.DEFAULT_OPTIONS = {
		velThreshold: 0.75,
		arrowData: {
			breakpoints: [0],
			speed: 4,
			step: 10
		},
	};

	StageView.prototype = Object.create(View.prototype);
	StageView.prototype.constructor = StageView;

	StageView.prototype.addMetNode = function(newNode) {
		newNode.initMetSubNode([/*this.syncScroll, this.syncSwipe*/], this.rootNode);
		_subscribeEvent(this, newNode);
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

	function _setupStageContainerSurface() {
        ////单色填充
        var METCOLORFILLTYPE = 0;
        ////渐变填充
        var METGRADIENTFILLTYPE = 1;
        ////图片填充
        var METIMAGEFILLTYPE = 2;
        ////无填充
        var METNONEFILLTYPE = 3;

        var containerSize = this.containerSize;
        this.stageContainerSurface = new ContainerSurface({
            size: this.projSize,
            zIndex: 1,
            properties: {
                overflow: "hidden",
                backgroundColor: "white",
            }
        });

        if (this.pageDesc.fillType == METCOLORFILLTYPE) {
            var fillColor = UnitConverter.rgba2ColorString(this.pageDesc.colorFill.fillColor);
            this.stageContainerSurface.setProperties({backgroundColor: fillColor});
        }
        else if (this.pageDesc.fillType == METGRADIENTFILLTYPE) {
            var gf = this.pageDesc.gradientFill;
            //{-888, 888}
            var start_point = gf.startPoint;
            {
                start_point = start_point.replace(/[\{\}]/g, "");
                start_point = start_point.split(",");
                if (!ir instanceof Array)
                    start_point = [0, 0];
                else
                    for (var i = 0; i < start_point.length; i++) start_point[i] = Number(start_point[i]);
            }
            //{-888, 888}
            var end_point = gf.endPoint;
            {
                end_point = end_point.replace(/[\{\}]/g, "");
                end_point = end_point.split(",");
                if (!ir instanceof Array)
                    end_point = [0, 0];
                else
                    for (var i = 0; i < end_point.length; i++) end_point[i] = Number(end_point[i]);
            }
            // sort gradientPoints's copy
            var gps = [];
            for (var i = 0; i < gf.gradientPoints.length; i++) {
                var gp = gf.gradientPoints[i];
                gps.push(gp);
            }
            gps.sort(function (obj1, obj2) {
                if (obj1.location > obj2.location)
                    return 1;
                else if (obj1.location < obj2.location)
                    return -1;
            });
            var bg_style = null;
            if (gf.gradientType == 0)
                bg_style = TextUtils.sprintf("%sgradient(linear, %d %d, %d %d", DebugUtils.browserPrefixes().css, start_point[0], start_point[1], end_point[0], end_point[1]);
            else {
                bg_style = TextUtils.sprintf("%sgradient(radial, %d %d, 0, %d %d, %d", DebugUtils.browserPrefixes().css, start_point[0], start_point[1], end_point[0], end_point[1], Math.max(this.projSize[0], this.projSize[1]));
            }
            for (var i = 0; i < gps.length; i++) {
                var gp = gps[i];
                var color = UnitConverter.rgba2ColorString(gp.color);
                if (i == 0)
                    bg_style += ", from(" + color + ")";
                else if (i == gps.length - 1)
                    bg_style += ", to(" + color + "))";
                else
                    bg_style += TextUtils.sprintf(", color-stop(%f, %s)", gp.location, color);
            }
            this.stageContainerSurface.setProperties({background: bg_style,});
        }
        else if (this.pageDesc.fillType == METIMAGEFILLTYPE) {
            var fillImage = this.pageDesc.imageFill.rawImageURL;
            // get imageRect
            //"imageRect" : "{{-850.35943603515625, -0.00079511082731187344}, {1616.3837890625, 1048.1239013671875}}",
            var ir = this.pageDesc.imageFill.imageRect;
            ir = ir.replace(/[\{\}]/g, "");
            ir = ir.split(",");
            if (!ir instanceof Array)
                ir = [0, 0, size[0], size[1]];

            this.stageContainerSurface.setProperties({
                backgroundImage: TextUtils.sprintf("url('zres/%s')", this.pageDesc.imageFill.rawImageURL),
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "relative",
                backgroundPosition: TextUtils.sprintf("%dpx %dpx", ir[0], ir[1]),
                backgroundSize: TextUtils.sprintf("%dpx %dpx", ir[2], ir[3]),
                backgroundColor: 'black',
            });
        }

        var pageScale = StageView.getPageContainerScale(this.containerSize[0], this.containerSize[1], this.projSize[0], this.projSize[1]);
        var modifier = new Modifier({
            align: [0.5, 0.5],
            transform: Transform.scale(pageScale, pageScale, 1),
        });

        this.add(modifier).add(this.stageContainerSurface);
        this._eventOutput.subscribe(this.stageContainerSurface);

        this.on('click', function (data) {
            DebugUtils.log(this.pageId + " type =  stage view event click");
        }.bind(this));
    }

	function _initRootNode() {
		var classes = ['z2'];

		var rootModifier = new Modifier({
			size: this.pageSize,
			origin: [0.5, 0],
			align: [0.5, 0],
		});

		var renderNode = new RenderNode();

		this.scrollView = new MetScrollview({paginated: false, bounce: false, size: this.projSize});
		this.scrollView.sequenceFrom([renderNode]);
		this.scrollView.subscribe(this.stageContainerSurface);

		this.stageContainerSurface.add(this.scrollView);
		this.rootNode = renderNode.add(rootModifier);
	}

	StageView.getPageContainerScale = function(viewportW, viewportH, origW, origH){
		var scaleX = viewportW / origW;
		var scaleY = viewportH / origH;
		return Math.min(scaleX, scaleY);
	}

	function _subscribeEvent(subscriber, src) {
		subscriber.subscribe(src);
	}

	module.exports = StageView;
});
