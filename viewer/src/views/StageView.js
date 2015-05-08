define(function(require, exports, module) {
    'use strict';
    var Engine        = require('famous/core/Engine');
    var Timer         = require('famous/utilities/Timer');

    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');

    var GenericSync   = require('famous/inputs/GenericSync');
    var MouseSync     = require('famous/inputs/MouseSync');
    var TouchSync     = require('famous/inputs/TouchSync');
    var ScrollSync    = require('famous/inputs/ScrollSync');

    GenericSync.register({
        'mouse': MouseSync,
        'touch': TouchSync,
        'scroll': ScrollSync
    });

    function StageView() {
        View.apply(this, arguments);
        this.worldScrollValue = 0;
        this._arrowData = this.options.arrowData;

        _setupScrollRecieverSurface.call(this);
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
        containerSize: [window.innerWidth, window.innerHeight]
    };

    StageView.prototype = Object.create(View.prototype);
    StageView.prototype.constructor = StageView;

    StageView.prototype.addMetNode = function(newNode) {
        newNode.activateMetNode([this.syncScroll, this.syncSwipe], this);
        //newNode.activate(this.syncSwipe);
        newNode.subscribe(this._eventOutput);
        this.add(newNode);
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

    function _setupScrollRecieverSurface() {
        this.scrollRecieverSurface = new Surface({
            size: [undefined, undefined] // Take up the entire view
        });

        this.add(this.scrollRecieverSurface);
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
                console.log("syncSwipe forward:" + velocity);
            } else if(velocity > 0 && velocity > this.options.velThreshold){
                _onForwardOrBackward.call(this, 'reverse');
                console.log("syncSwipe backward:" + velocity);
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
