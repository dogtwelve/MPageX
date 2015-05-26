define(function(require, exports, module) {
    'use strict';
    var Engine        = require('famous/core/Engine');
    var Timer         = require('famous/utilities/Timer');

    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var Modifier      = require('famous/core/Modifier');

    var ImageSurface  = require('famous/surfaces/ImageSurface');

    var GenericSync   = require('famous/inputs/GenericSync');
    var MouseSync     = require('famous/inputs/MouseSync');
    var TouchSync     = require('famous/inputs/TouchSync');
    var ScrollSync    = require('famous/inputs/ScrollSync');

    var UnitConverter = require('tools/UnitConverter');
    var BgImageSurface = require('surfaces/BgImageSurface');
    var DebugUtils = require('utils/DebugUtils');

    GenericSync.register({
        'mouse': MouseSync,
        'touch': TouchSync,
        'scroll': ScrollSync
    });

    function StageView() {
        View.apply(this, arguments);
        this.worldScrollValue = 0;
        this._arrowData = this.options.arrowData;
        this.pageDesc = this.options.pageDesc;
        this.containerSize = this.options.contextSize;
        this.bgSize = this.options.bgSize;

        _setupScrollRecieverSurface.call(this);
        _setupContextContainer.call(this);
        _handleScroll.call(this);
        _handleSwipe.call(this);
        _setupArrowKeyBreakpoints.call(this, 16, 60);
    }

    StageView.DEFAULT_OPTIONS = {
        velThreshold: 0.75,
        arrowData: {
            breakpoints: [0],
            speed: 4,
            step: 10
        },
        //containerSize: [window.innerWidth, window.innerHeight]
    };

    StageView.prototype = Object.create(View.prototype);
    StageView.prototype.constructor = StageView;

    StageView.prototype.addMetNode = function(newNode) {
        newNode.initMetNode([this.syncScroll, this.syncSwipe], this);
        //newNode.activate(this.syncSwipe);
        newNode.subscribe(this._eventOutput);
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

    function _setupContextContainer(){
        //this.contextContainer = new ContainerSurface({
        //    //size: [1000, 600]
        //    //properties: {
        //    //    overflow: 'hidden'
        //    //}
        //
        //    //properties: {
        //    //    backgroundImage: 'url(' + this.pageDesc.imageFill.rawImageURL + ')'
        //    //}
        //});
        //
        //this.add(this.contextContainer);
        //
        //this.contextContainer.context.setPerspective(3000);
    }

    function _setupScrollRecieverSurface() {
        ////单色填充
        var METCOLORFILLTYPE = 0;
        ////渐变填充
        var METGRADIENTFILLTYPE = 1;
        ////图片填充
        var METIMAGEFILLTYPE = 2;
        ////无填充
        var METNONEFILLTYPE = 3;

        var classes = ['z1'];

        if(this.pageDesc.fillType == METCOLORFILLTYPE) {
            var fillColor = UnitConverter.decimalToHexColorString(this.pageDesc.colorFill.fillColor);
            this.scrollRecieverSurface = new Surface({
                //size: [undefined, undefined] // Take up the entire view
                size: this.bgSize,
                classes: classes,
                properties: {
                    backgroundColor: fillColor
                }
            });
        } else if(this.pageDesc.fillType == METIMAGEFILLTYPE) {
            var fillImage = this.pageDesc.imageFill.rawImageURL;
            var contentMode = this.pageDesc.imageFill.contentMode;
            this.scrollRecieverSurface = new BgImageSurface({
                size: this.bgSize,
                content: fillImage,
                classes: classes,
                sizeMode: BgImageSurface.SizeMode.ASPECTFILL,
                properties: {
                    backgroundColor: 'black'
                }
            });
        } else {
            this.scrollRecieverSurface = new Surface({
                size: this.bgSize,
                classes: classes,
                properties: {
                    backgroundColor: 'gray',
                }
            });
        }

        var modifier = new Modifier({
            size: this.bgSize,
            origin: [0.5, 0.5],
            align: [0.5, 0.5]
        });

        this.add(modifier).add(this.scrollRecieverSurface);
    }

    function _handleScroll() {
        this.syncScroll = new GenericSync(
            ['touch', 'scroll'],
            {direction: GenericSync.DIRECTION_Y}
        );

        this.scrollRecieverSurface.pipe(this.syncScroll);

        this.syncScroll.on('update', function(data) {
            // Invert delta so scrolling up is positive.
            this.worldScrollValue -= data.delta;
            _emitScrollUpdate.call(this, data.delta);
        }.bind(this));

        this.syncScroll.on('end', function(data) {
        }.bind(this));
    }

    function _handleSwipe() {
        this.syncSwipe = new GenericSync(
            ['mouse', 'touch'],
            {direction : GenericSync.DIRECTION_X}
        );

        this.scrollRecieverSurface.pipe(this.syncSwipe);

        this.syncSwipe.on('update', function(data) {
            //var currentPosition = this.pageViewPos.get();
            //if(currentPosition === 0 && data.velocity > 0) {
            //    this.menuView.animateStrips();
            //}
            //
            //this.pageViewPos.set(Math.max(0, currentPosition + data.delta));
        }.bind(this));

        this.syncSwipe.on('end', (function(data) {
            var velocity = data.velocity;
            //var position = this.pageViewPos.get();
            //
            //if(this.pageViewPos.get() > this.options.posThreshold) {
            //    if(velocity < -this.options.velThreshold) {
            //        this.slideLeft();
            //    } else {
            //        this.slideRight();
            //    }
            //} else {
            //    if(velocity > this.options.velThreshold) {
            //        this.slideRight();
            //    } else {
            //        this.slideLeft();
            //    }
            //}

            if(velocity < 0 && velocity < -this.options.velThreshold) {
                _onForwardOrBackward.call(this, 'forward');
                DebugUtils.log("syncSwipe forward:" + velocity);
            } else if(velocity > 0 && velocity > this.options.velThreshold){
                _onForwardOrBackward.call(this, 'reverse');
                DebugUtils.log("syncSwipe backward:" + velocity);
            }
        }).bind(this));
    }

    function _emitScrollUpdate(delta) {
        this._eventOutput.emit('ScrollUpdated', {delta: -delta});
    }

    function _onForwardOrBackward(direction) {
        // If movement is already in progress, cancel interval
        if (this._arrowData.interval) {
            Timer.clear(this._arrowData.interval);
            delete this._arrowData.interval;
        }
        // Set next lowest breakpoint
        var nextBreakpoint = getNextScrollPoint.call(this, direction);



        this._arrowData.interval = Timer.setInterval(function() {
            if ((direction === 'reverse' && this.worldScrollValue <= nextBreakpoint) ||
                (direction === 'forward' && this.worldScrollValue >= nextBreakpoint)) {
                Timer.clear(this._arrowData.interval);
                delete this._arrowData.interval;
            } else {
                if (direction === 'forward' ? this.worldScrollValue < nextBreakpoint : this.worldScrollValue > nextBreakpoint) {
                    var currentStep = Math.min(this._arrowData.step, direction === 'forward' ? nextBreakpoint - this.worldScrollValue : this.worldScrollValue - nextBreakpoint);
                    currentStep = direction === 'forward' ? -currentStep : currentStep;
                    this.worldScrollValue -= currentStep;
                    _emitScrollUpdate.call(this, currentStep);
                } else {
                    Timer.clear(this._arrowData.interval);
                    delete this._arrowData.interval;
                }
            }
        }.bind(this), this._arrowData.speed);

        // Function assumes that the breakboards are sorted lowest to highest.
        function getNextScrollPoint(searchDirection) {
            searchDirection = searchDirection ? searchDirection : 'forward';

            var searchBreakpoints = this._arrowData.breakpoints;
            var nextScrollPoint; //init undefined

            if (searchDirection !== 'forward') {
                searchBreakpoints = searchBreakpoints.slice(0).reverse(); //copy array so we don't mutate the original with the reverse;
            }

            for (var i = 0; i < searchBreakpoints.length; i++) {
                if ((searchDirection === 'forward' && this.worldScrollValue < searchBreakpoints[i]) ||
                    (searchDirection !== 'forward' && this.worldScrollValue > searchBreakpoints[i])) {
                    nextScrollPoint = searchBreakpoints[i];
                    break;
                }
            }

            return nextScrollPoint;
        }
    }

    function _setupArrowKeyBreakpoints(speed, step) {
        var leftArrowKeyCode = 37;
        var upArrowKeyCode = 38;
        var rightArrowKeyCode = 39;
        var downArrowKeyCode = 40;

        this._arrowData.speed = speed || this._arrowData.speed;
        this._arrowData.step = step || this._arrowData.step;

        var nextBreakpoint; //init undefined

        Engine.on('keydown', function(e) {
            var direction;

            //// If movement is already in progress, cancel interval
            //if (this._arrowData.interval) {
            //    Timer.clear(this._arrowData.interval);
            //    delete this._arrowData.interval;
            //}

            // Arrow key selected
            if (e.keyCode === downArrowKeyCode || e.keyCode === leftArrowKeyCode ||
                e.keyCode === upArrowKeyCode || e.keyCode === rightArrowKeyCode) {

                //Determine direction to move
                if (e.keyCode === downArrowKeyCode || e.keyCode === rightArrowKeyCode) {
                    direction = 'forward';
                } else {
                    direction = 'reverse';
                }

                _onForwardOrBackward.call(this, direction);

                //// Set next lowest breakpoint
                //nextBreakpoint = getNextScrollPoint.call(this, direction);
                //
                //this._arrowData.interval = Timer.setInterval(function() {
                //    if ((direction === 'reverse' && this.worldScrollValue <= nextBreakpoint) ||
                //        (direction === 'forward' && this.worldScrollValue >= nextBreakpoint)) {
                //        Timer.clear(this._arrowData.interval);
                //        delete this._arrowData.interval;
                //    } else {
                //        if (direction === 'forward' ? this.worldScrollValue < nextBreakpoint : this.worldScrollValue > nextBreakpoint) {
                //            var currentStep = Math.min(this._arrowData.step, direction === 'forward' ? nextBreakpoint - this.worldScrollValue : this.worldScrollValue - nextBreakpoint);
                //            currentStep = direction === 'forward' ? -currentStep : currentStep;
                //            this.worldScrollValue -= currentStep;
                //            _emitScrollUpdate.call(this, currentStep);
                //        } else {
                //            Timer.clear(this._arrowData.interval);
                //            delete this._arrowData.interval;
                //        }
                //    }
                //}.bind(this), this._arrowData.speed);
            }

            //// Function assumes that the breakboards are sorted lowest to highest.
            //function getNextScrollPoint(searchDirection) {
            //    searchDirection = searchDirection ? searchDirection : 'forward';
            //
            //    var searchBreakpoints = this._arrowData.breakpoints;
            //    var nextScrollPoint; //init undefined
            //
            //    if (searchDirection !== 'forward') {
            //        searchBreakpoints = searchBreakpoints.slice(0).reverse(); //copy array so we don't mutate the original with the reverse;
            //    }
            //
            //    for (var i = 0; i < searchBreakpoints.length; i++) {
            //        if ((searchDirection === 'forward' && this.worldScrollValue < searchBreakpoints[i]) ||
            //            (searchDirection !== 'forward' && this.worldScrollValue > searchBreakpoints[i])) {
            //            nextScrollPoint = searchBreakpoints[i];
            //            break;
            //        }
            //    }
            //
            //    return nextScrollPoint;
            //}
        }.bind(this));
    }

    module.exports = StageView;
});
