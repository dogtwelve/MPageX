define(function (require, exports, module) {
    var Engine = require('famous/core/Engine');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var View = require('famous/core/View');
    var Scrollview = require('famous/Kviews/KScrollview');
    var StateModifier = require('famous/modifiers/StateModifier');
    Timeline = function Timeline(options) {
        View.apply(this, arguments);//Init
        if (arguments[0].options)
            this._optionsManager.setOptions(arguments[0].options);
        this.mode = options.mode;
        this.onUpdate = options.onUpdate;
        this.curIndex = 0;
        this.lastDirectionIsNext = true;
        // Note: Scroll up and down to progress through
        // each of three experiences creatable directly
        // from different parameters to Scrollview.
        this.outputTypeEnum = {
            Z_SCROLLER: 0,
            CAROUSEL: 1,
            HELIX: 2,
            X_SCROLLER: 3,
            X_SCROLLER_EX: 4,
            CAROUSEL_X: 5,
            HELIX_X: 6,
            PARAPOL: 7
        }
        // note: change the type of experience you want here
        // by setting to one of the above values
        this.outputType = this.mode == "3D" ? this.outputTypeEnum.HELIX : this.outputTypeEnum.HELIX;
        /*Create View*/
        var option = Scrollview.DEFAULT_OPTIONS;
        option.fog = this.mode == "3D" ? options.fog : 0;
        option.margin = options.margin
        option.onUpdate = this.onUpdate;
        this.scrollview = new Scrollview(option);
        this.surfaces = [];
        this.scrollview.sequenceFrom(this.surfaces);
        Engine.pipe(this.scrollview);
        //Engine.on('touchmove',scrollview.goToNextPage.bind(scrollview));
        this.data = options.data;
        this.OnSelected = options.OnSelected;
        //Create surface with set data;
        this.surfaceW = options.width;
        this.surfaceH = options.height;
        _createSurfaces.call(this);

        var self = this;
        var fishEye = 0;
        this.scrollview.outputFrom(function (offset) {

            switch (self.outputType) {
                case (self.outputTypeEnum.Z_SCROLLER):
                    //console.log(offset);
                    return Transform.translate(0, -offset / 1.5, -offset);
                case (self.outputTypeEnum.X_SCROLLER):
                    //console.log(offset);
                    return Transform.translate(offset, 0, 0);
                case (self.outputTypeEnum.X_SCROLLER_EX):
                    //console.log(offset);
                    return Transform.translate(offset / 3, 0, 0);
                case (self.outputTypeEnum.CAROUSEL):
                    return Transform.moveThen([0, 0, 600], Transform.rotateY((3.14 * 2.0 / (self.data.length * self.surfaceW)) * offset));
                case (self.outputTypeEnum.CAROUSEL_X):
                    return Transform.moveThen([0, 0, 600], Transform.rotateX((3.14 * 2.0 / (self.data.length * self.surfaceW)) * offset));
                case (self.outputTypeEnum.HELIX_X):
                    return Transform.moveThen([0, -offset / 10.0, 600 - Math.abs(offset / 10.0)], Transform.rotateY(0.0025 * offset));

                case (self.outputTypeEnum.HELIX):
                default:
                    return Transform.moveThen([0, offset / 6, 400], Transform.rotateY(0.0025 * offset));
            }
        });


        this.add(this.scrollview)

    }

    Timeline.prototype = Object.create(View.prototype);
    Timeline.prototype.constructor = Timeline;

    Timeline.prototype.setMode = function (mode) {
        this.mode = mode;
        this.outputType = this.mode == "3D" ? this.outputTypeEnum.Z_SCROLLER : this.outputTypeEnum.X_SCROLLER;
        var option = Scrollview.DEFAULT_OPTIONS;
        option.fog = this.mode == "3D" ? 0.3 : 0;
        this.scrollview.setOptions(option);
    }
    Timeline.prototype.updateData = function (data) {
        this.data = data;
        this.surfaces = [];
        _createSurfaces.call(this);
        this.scrollview.sequenceFrom(this.surfaces);

    }

    var _createSurfaces = function () {
        var self = this;
        //dummy 3 last surface
        for (var i = 0; i < this.data.length + 3; i++) {
            var surface = new Surface({
                size: [this.surfaceW, this.surfaceH],
                properties: {
                    backgroundColor: i > this.data.length - 1 ? "rgba(0,0,0,0)" : "hsl(" + (i * 360 / 50) + ", 100%, 50%)",
                    webkitBackfaceVisibility: 'visible',
                    boxShadow: i > this.data.length - 1 ? '0 0 0px rgba(0,0,0,0.5)' : '0 0 20px rgba(0,0,0,0.5)'
                }
            });
            //dummy 2 element
            if (i >= 0 && i < this.data.length) {
                //setdata
                surface.appId = i;
                surface.setContent(this.data[i]);

                function click(timeline) {
                    // var next = this.appId != timeline.curIndex ? this.appId : timeline.curIndex - 1;
                    //var next = this.appId != timeline.curIndex ? this.appId : 0;
                    if (timeline.OnSelected) {
                        var next = this.appId;
                        if (next == timeline.curIndex)
                            next = 0;//timeline.curIndex - 1; with error
                        if (next < 0) next = 0;
                        timeline.OnSelected(next);
                        timeline.curIndex = next;
                    }
                }

                surface.on("click", click.bind(surface, self));
            }


            this.surfaces.push(surface);
        }
    }

    Timeline.prototype.goToPage = function (index) {
        //if(this.scrollview.goToPage(index==this.curIndex?0:index))
        this.scrollview.goToPage(index);
        return;

    }
    Timeline.prototype.goToPreviousPage = function () {
        //if(this.scrollview.goToPage(index==this.curIndex?0:index))
        this.scrollview.goToPreviousPage();
        return;

    }

    module.exports = Timeline;
})
