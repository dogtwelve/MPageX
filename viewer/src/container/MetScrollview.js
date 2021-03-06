define(function(require, exports, module) {
    var PhysicsEngine = require('famous/physics/PhysicsEngine');
    var Particle = require('famous/physics/bodies/Particle');
    var Drag = require('famous/physics/forces/Drag');
    var Spring = require('famous/physics/forces/Spring');

    var EventHandler = require('famous/core/EventHandler');
    var OptionsManager = require('famous/core/OptionsManager');
    var ViewSequence = require('famous/core/ViewSequence');
    var Scroller = require('famous/views/Scroller');
    var Utility = require('famous/utilities/Utility');

    var GenericSync = require('famous/inputs/GenericSync');
    var ScrollSync = require('famous/inputs/ScrollSync');
    var TouchSync = require('famous/inputs/TouchSync');
    var MouseSync = require('famous/inputs/MouseSync');
    GenericSync.register({mouse: MouseSync, scroll: ScrollSync, touch: TouchSync});

    /** @const */
    var TOLERANCE = 0.5;

    /** @enum */
    var SpringStates = {
        NONE: 0,
        EDGE: 1,
        PAGE: 2,
        FOOTPRINT: 3,
    };

    /** @enum */
    var EdgeStates = {
        TOP: -1,
        NONE: 0,
        BOTTOM: 1
    };

    /**
     * MetScrollview will lay out a collection of renderables sequentially in the specified direction, and will
     * allow you to scroll through them with mousewheel or touch events.
     * @class MetScrollview
     * @constructor
     * @param {Options} [options] An object of configurable options.
     * @param {Number} [options.direction=Utility.Direction.Y] Using the direction helper found in the famous Utility
     * module, this option will lay out the MetScrollview instance's renderables either horizontally
     * (x) or vertically (y). Utility's direction is essentially either zero (X) or one (Y), so feel free
     * to just use integers as well.
     * @param {Boolean} [options.rails=true] When true, MetScrollview's genericSync will only process input in it's primary access.
     * @param {Number} [clipSize=undefined] The size of the area (in pixels) that MetScrollview will display content in.
     * @param {Number} [margin=undefined] The size of the area (in pixels) that MetScrollview will process renderables' associated calculations in.
     * @param {Number} [friction=0.001] Input resistance proportional to the velocity of the input.
     * Controls the feel of the MetScrollview instance at low velocities.
     * @param {Number} [drag=0.0001] Input resistance proportional to the square of the velocity of the input.
     * Affects MetScrollview instance more prominently at high velocities.
     * @param {Number} [edgeGrip=0.5] A coefficient for resistance against after-touch momentum.
     * @param {Number} [egePeriod=300] Sets the period on the spring that handles the physics associated
     * with hitting the end of a MetScrollview.
     * @param {Number} [edgeDamp=1] Sets the damping on the spring that handles the physics associated
     * with hitting the end of a MetScrollview.
     * @param {Boolean} [paginated=false] A paginated MetScrollview will scroll through items discretely
     * rather than continously.
     * @param {Number} [pagePeriod=500] Sets the period on the spring that handles the physics associated
     * with pagination.
     * @param {Number} [pageDamp=0.8] Sets the damping on the spring that handles the physics associated
     * with pagination.
     * @param {Number} [pageStopSpeed=Infinity] The threshold for determining the amount of velocity
     * required to trigger pagination. The lower the threshold, the easier it is to scroll continuosly.
     * @param {Number} [pageSwitchSpeed=1] The threshold for momentum-based velocity pagination.
     * @param {Number} [speedLimit=10] The highest scrolling speed you can reach.
     */
    function MetScrollview(options) {
        // patch options with defaults
        this.options = Object.create(MetScrollview.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);

        // create sub-components
        this._scroller = new Scroller(this.options);

        this.sync = new GenericSync(
            ['scroll', 'touch', 'mouse'],
            {
                direction: this.options.direction,
                scale: this.options.syncScale,
                rails: this.options.rails,
                preventDefault: this.options.preventDefault !== undefined
                    ? this.options.preventDefault
                    : this.options.direction !== Utility.Direction.Y
            }
        );

        this._physicsEngine = new PhysicsEngine();
        this._particle = new Particle();
        this._physicsEngine.addBody(this._particle);

        this.spring = new Spring({
            anchor: [0, 0, 0],
            period: this.options.edgePeriod,
            dampingRatio: this.options.edgeDamp
        });
        this.drag = new Drag({
            forceFunction: Drag.FORCE_FUNCTIONS.QUADRATIC,
            strength: this.options.drag
        });
        this.friction = new Drag({
            forceFunction: Drag.FORCE_FUNCTIONS.LINEAR,
            strength: this.options.friction
        });

        // state
        this._node = null;
        this._touchCount = 0;
        this._springState = SpringStates.NONE;
        this._onEdge = EdgeStates.NONE;
        this._footprintSpringPosition = 0;
        this._pageSpringPosition = 0;
        this._edgeSpringPosition = 0;
        this._touchVelocity = 0;
        this._earlyEnd = false;
        this._needsPaginationCheck = false;
        this._needsFootprintCheck = false;
        this._displacement = 0;
        this._totalShift = 0;
        this._cachedIndex = 0;

        // footprints, must be sorted ascent
        this._footprints = null;

        // subcomponent logic
        this._scroller.positionFrom(this.getPosition.bind(this));

        // eventing
        this._eventInput = new EventHandler();
        this._eventOutput = new EventHandler();

        this._eventInput.pipe(this.sync);
        this.sync.pipe(this._eventInput);

        EventHandler.setInputHandler(this, this._eventInput);
        EventHandler.setOutputHandler(this, this._eventOutput);

        _bindEvents.call(this);

        // override default options with passed-in custom options
        if (options) this.setOptions(options);
    }

    MetScrollview.DEFAULT_OPTIONS = {
        direction: Utility.Direction.Y,
        rails: true,
        friction: 0.005,
        drag: 0.0001,
        edgeGrip: 0.2,
        edgePeriod: 300,
        edgeDamp: 1,
        margin: 1000,       // mostly safe

        paginated: false,
        pagePeriod: 500,
        pageDamp: 0.8,
        pageStopSpeed: 10,
        pageSwitchSpeed: 0.5,

        footprinted: false,
        footprintPeriod: 500,
        footprintDamp: 0.8,
        footpintStopSpeed: 10,
        footprintSwitchSpeed: 0.5,

        speedLimit: 5,
        groupScroll: false,
        syncScale: 1,

        bounce: true,
    };

    function _arrayCopy(arr) {
        var array = [];
        for (var i = 0; i < arr.length; i++)
            array.push(arr[i]);
        return array;
    }

    function _handleStart(event) {
        this._touchCount = event.count;
        if (event.count === undefined) this._touchCount = 1;

        _detachAgents.call(this);

        this.setVelocity(0);
        this._touchVelocity = 0;
        this._earlyEnd = false;
    }

    function _handleMove(event) {
        var velocity = -event.velocity;
        var delta = -event.delta;

        // limit scrolling range for non-bounce scrollview
        if (!this.options.bounce) {
            var pos = this.getPosition();
            var vsize = _viewSizeForDirection.call(this);
            var nsize = _nodeSizeForDirection.call(this, this._node);
            if (delta > 0) {
                if (pos + delta >= nsize - vsize) {
                    delta = nsize - vsize - pos;
                    if (delta == 0) {
                        velocity = 0;
                        this._onEdge = EdgeStates.BOTTOM;
                    }
                }
            }
            else {
                if (pos + delta <= 0) {
                    delta = -pos;
                    if (delta == 0) {
                        velocity = 0;
                        this._onEdge = EdgeStates.TOP;
                    }
                }
            }
        }

        if (this._onEdge !== EdgeStates.NONE && event.slip) {
            if ((velocity < 0 && this._onEdge === EdgeStates.TOP) || (velocity > 0 && this._onEdge === EdgeStates.BOTTOM)) {
                if (!this._earlyEnd) {
                    _handleEnd.call(this, event);
                    this._earlyEnd = true;
                }
            }
            else if (this._earlyEnd && (Math.abs(velocity) > Math.abs(this.getVelocity()))) {
                _handleStart.call(this, event);
            }
        }
        if (this._earlyEnd) return;

        this._touchVelocity = velocity;

        if (event.slip) {
            var speedLimit = this.options.speedLimit;
            if (velocity < -speedLimit) velocity = -speedLimit;
            else if (velocity > speedLimit) velocity = speedLimit;

            this.setVelocity(velocity);

            var deltaLimit = speedLimit * 16;
            if (delta > deltaLimit) delta = deltaLimit;
            else if (delta < -deltaLimit) delta = -deltaLimit;
        }

        this.setPosition(this.getPosition() + delta);
        this._displacement += delta;

        if (this._springState === SpringStates.NONE) _normalizeState.call(this);
    }

    function _handleEnd(event) {
        this._touchCount = event.count || 0;
        if (!this._touchCount) {
            _detachAgents.call(this);
            if (this._onEdge !== EdgeStates.NONE) _setSpring.call(this, this._edgeSpringPosition, SpringStates.EDGE);
            _attachAgents.call(this);
            var velocity = -event.velocity;

            // limit scrolling range for non-bounce scrollview
            if (!this.options.bounce) {
                if(this._onEdge !== EdgeStates.NONE) velocity = 0;
            }

            var speedLimit = this.options.speedLimit;
            if (event.slip) speedLimit *= this.options.edgeGrip;
            if (velocity < -speedLimit) velocity = -speedLimit;
            else if (velocity > speedLimit) velocity = speedLimit;
            this.setVelocity(velocity);
            this._touchVelocity = 0;
            this._needsPaginationCheck = true;
            this._needsFootprintCheck = true;
        }
    }

    function _bindEvents() {
        this._eventInput.bindThis(this);

        this._eventInput.on('start', function(event){
            _handleStart.call(this, event);
            this._eventOutput.emit('start');
        }.bind(this));
        this._eventInput.on('update', function(event){
            _handleMove.call(this, event);
            this._eventOutput.emit('update');
        }.bind(this));
        this._eventInput.on('end', function(event){
            _handleEnd.call(this, event);
            this._eventOutput.emit('end');
        }.bind(this));

        this._eventInput.on('resize', function () {
            this._node._.calculateSize();
        }.bind(this));

        this._scroller.on('onEdge', function (data) {
            this._edgeSpringPosition = data.position;
            _handleEdge.call(this, this._scroller.onEdge());
            this._eventOutput.emit('onEdge');
        }.bind(this));

        this._scroller.on('offEdge', function () {
            this.sync.setOptions({scale: this.options.syncScale});
            this._onEdge = this._scroller.onEdge();
            this._eventOutput.emit('offEdge');
        }.bind(this));

        this._particle.on('update', function (particle) {
            if (this._springState === SpringStates.NONE) _normalizeState.call(this);
            this._displacement = particle.position.x - this._totalShift;
            _checkFootprints.call(this);
        }.bind(this));

        this._particle.on('end', function () {
            if (!this.options.paginated || (this.options.paginated && this._springState !== SpringStates.NONE))
                this._eventOutput.emit('settle');
        }.bind(this));
    }

    function _attachAgents() {
        if (this._springState) this._physicsEngine.attach([this.spring], this._particle);
        else this._physicsEngine.attach([this.drag, this.friction], this._particle);
    }

    function _detachAgents() {
        this._springState = SpringStates.NONE;
        this._physicsEngine.detachAll();
    }

    function _nodeSizeForDirection(node) {
        var direction = this.options.direction;
        var nodeSize = node.getSize();
        return (!nodeSize) ? this._scroller.getSize()[direction] : nodeSize[direction];
    }

    function _viewSizeForDirection() {
        var direction = this.options.direction;
        var viewSize = this.getSize();
        return (!viewSize) ? 0 : viewSize[direction];
    }

    function _handleEdge(edge) {
        this.sync.setOptions({scale: this.options.edgeGrip});
        this._onEdge = edge;

        if (!this._touchCount && this._springState !== SpringStates.EDGE) {
            _setSpring.call(this, this._edgeSpringPosition, SpringStates.EDGE);
        }

        if (this._springState && Math.abs(this.getVelocity()) < 0.001) {
            // reset agents, detaching the spring
            _detachAgents.call(this);
            _attachAgents.call(this);
        }
    }

    function _handlePagination() {
        if (this._touchCount) return;
        if (this._springState === SpringStates.EDGE) return;

        var velocity = this.getVelocity();
        if (Math.abs(velocity) >= this.options.pageStopSpeed) return;

        var position = this.getPosition();
        var velocitySwitch = Math.abs(velocity) > this.options.pageSwitchSpeed;

        // parameters to determine when to switch
        var nodeSize = _nodeSizeForDirection.call(this, this._node);
        var positionNext = position > 0.5 * nodeSize;
        var positionPrev = position < 0.5 * nodeSize;

        var velocityNext = velocity > 0;
        var velocityPrev = velocity < 0;

        this._needsPaginationCheck = false;

        if ((positionNext && !velocitySwitch) || (velocitySwitch && velocityNext)) {
            this.goToNextPage();
        }
        else if (velocitySwitch && velocityPrev) {
            this.goToPreviousPage();
        }
        else _setSpring.call(this, 0, SpringStates.PAGE);
    }

    function _handleFootprint() {
        if (this._touchCount) return;
        if (this._springState === SpringStates.EDGE) return;

        if (!((this._footprints instanceof Array) && this._footprints.length > 0)) return;

        var velocity = this.getVelocity();
        if (Math.abs(velocity) >= this.options.footprintStopSpeed) return;

        var position = this.getPosition();
        var velocitySwitch = Math.abs(velocity) > this.options.footprintSwitchSpeed;

        // parameters to determine when to switch
        var nodeSize = _nodeSizeForDirection.call(this, this._node);
        var viewSize = _viewSizeForDirection.call(this);
        var fts = _arrayCopy(this._footprints);
        fts = fts.filter(function (obj) {
            var val = obj.loc;
            return (val >= 0 + viewSize / 2 - .5 && val <= nodeSize - viewSize / 2 + .5);
        });

        var loc_cur = -1, loc_prev = 0, loc_next = 0;
        for (var i = 0; i < fts.length - 1; i++) {
            if (position >= fts[i].loc - viewSize / 2 && position <= fts[i + 1].loc - viewSize / 2) {
                loc_cur = fts[i].loc - viewSize / 2;
                loc_next = fts[i + 1].loc - viewSize / 2;
                if (i > 0)
                    loc_prev = fts[i - 1].loc - viewSize / 2;
                else
                    loc_prev = Math.max(0, loc_cur - viewSize / 2);
                break;
            }
        }
        if (loc_cur == -1) return;

        var positionNext = position > 0.5 * (loc_next + loc_cur);
        var positionPrev = position < 0.5 * (loc_prev + loc_cur);

        var velocityNext = velocity > 0;
        var velocityPrev = velocity < 0;

        this._needsFootprintCheck = false;

        if ((positionNext && !velocitySwitch) || (velocitySwitch && velocityNext))
            _setSpring.call(this, loc_next, SpringStates.FOOTPRINT);
        else if (velocitySwitch && velocityPrev)
            _setSpring.call(this, loc_prev, SpringStates.FOOTPRINT);
        else
            _setSpring.call(this, loc_cur, SpringStates.FOOTPRINT);
    }

    function _checkFootprints() {
        if (!((this._footprints instanceof Array) && this._footprints.length > 0)) return;
        // will compare self.contentOffset to footprints in following algo, the compare result may be
        // bigger:3, smaller:2, near:1, init:0
        var at_flags = [
            //--- 0  1  2  3
            /*0*/[0, 1, 0, 0],
            /*1*/[0, 0, 0, 0],
            /*2*/[0, 1, 0, 1],
            /*3*/[0, 1, 1, 0],
        ];
        var epsilon = 1.0;
        var viewSize = _viewSizeForDirection.call(this);
        var off = this.getOffset();
        for (var i = 0; i < this._footprints.length; i++) {
            var ft = this._footprints[i];
            var dist = off - (ft.loc - viewSize / 2);
            var oat = ft.at;
            if (dist > epsilon)
                ft.at = 3;
            else if (dist < epsilon)
                ft.at = 2;
            else
                ft.at = 1;
            if (at_flags[oat][ft.at] == 1) {
                this._eventOutput.emit('onFootprint', {location: ft.loc, at: ft.at});
            }
            if (dist >= -viewSize / 2 && dist <= viewSize / 2) {
                this._eventOutput.emit('hookFootprint', {location: ft.loc, offset: dist});
            }
        }
    }

    function _setSpring(position, springState) {
        var springOptions;
        if (springState === SpringStates.EDGE) {
            this._edgeSpringPosition = position;
            springOptions = {
                anchor: [this._edgeSpringPosition, 0, 0],
                period: this.options.edgePeriod,
                dampingRatio: this.options.edgeDamp
            };
        }
        else if (springState === SpringStates.PAGE) {
            this._pageSpringPosition = position;
            springOptions = {
                anchor: [this._pageSpringPosition, 0, 0],
                period: this.options.pagePeriod,
                dampingRatio: this.options.pageDamp
            };
        }
        else if (springState === SpringStates.FOOTPRINT) {
            this._footprintSpringPosition = position;
            springOptions = {
                anchor: [this._footprintSpringPosition, 0, 0],
                period: this.options.footprintPeriod,
                dampingRatio: this.options.footprintDamp
            };
        }

        this.spring.setOptions(springOptions);
        if (springState && !this._springState) {
            _detachAgents.call(this);
            this._springState = springState;
            _attachAgents.call(this);
        }
        this._springState = springState;
    }

    function _normalizeState() {
        var offset = 0;

        var position = this.getPosition();
        position += (position < 0 ? -0.5 : 0.5) >> 0;

        var nodeSize = _nodeSizeForDirection.call(this, this._node);
        var nextNode = this._node.getNext();

        while (offset + position >= nodeSize && nextNode) {
            offset -= nodeSize;
            this._scroller.sequenceFrom(nextNode);
            this._node = nextNode;
            nextNode = this._node.getNext();
            nodeSize = _nodeSizeForDirection.call(this, this._node);
        }

        var previousNode = this._node.getPrevious();
        var previousNodeSize;

        while (offset + position <= 0 && previousNode) {
            previousNodeSize = _nodeSizeForDirection.call(this, previousNode);
            this._scroller.sequenceFrom(previousNode);
            this._node = previousNode;
            offset += previousNodeSize;
            previousNode = this._node.getPrevious();
        }

        if (offset) _shiftOrigin.call(this, offset);

        if (this._node) {
            if (this._node.index !== this._cachedIndex) {
                if (this.getPosition() < 0.5 * nodeSize) {
                    this._cachedIndex = this._node.index;
                    this._eventOutput.emit('pageChange', {direction: -1, index: this._cachedIndex});
                }
            } else {
                if (this.getPosition() > 0.5 * nodeSize) {
                    this._cachedIndex = this._node.index + 1;
                    this._eventOutput.emit('pageChange', {direction: 1, index: this._cachedIndex});
                }
            }
        }
    }

    function _shiftOrigin(amount) {
        this._edgeSpringPosition += amount;
        this._pageSpringPosition += amount;
        this.setPosition(this.getPosition() + amount);
        this._totalShift += amount;

        if (this._springState === SpringStates.EDGE) {
            this.spring.setOptions({anchor: [this._edgeSpringPosition, 0, 0]});
        }
        else if (this._springState === SpringStates.PAGE) {
            this.spring.setOptions({anchor: [this._pageSpringPosition, 0, 0]});
        }
    }

    /**
     * Returns the index of the first visible renderable
     *
     * @method getCurrentIndex
     * @return {Number} The current index of the ViewSequence
     */
    MetScrollview.prototype.getCurrentIndex = function getCurrentIndex() {
        return this._node.index;
    };

    /**
     * goToPreviousPage paginates your MetScrollview instance backwards by one item.
     *
     * @method goToPreviousPage
     * @return {ViewSequence} The previous node.
     */
    MetScrollview.prototype.goToPreviousPage = function goToPreviousPage() {
        if (!this._node || this._onEdge === EdgeStates.TOP) return null;

        // if moving back to the current node
        if (this.getPosition() > 1 && this._springState === SpringStates.NONE) {
            _setSpring.call(this, 0, SpringStates.PAGE);
            return this._node;
        }

        // if moving to the previous node
        var previousNode = this._node.getPrevious();
        if (previousNode) {
            var previousNodeSize = _nodeSizeForDirection.call(this, previousNode);
            this._scroller.sequenceFrom(previousNode);
            this._node = previousNode;
            _shiftOrigin.call(this, previousNodeSize);
            _setSpring.call(this, 0, SpringStates.PAGE);
        }
        return previousNode;
    };

    /**
     * goToNextPage paginates your MetScrollview instance forwards by one item.
     *
     * @method goToNextPage
     * @return {ViewSequence} The next node.
     */
    MetScrollview.prototype.goToNextPage = function goToNextPage() {
        if (!this._node || this._onEdge === EdgeStates.BOTTOM) return null;
        var nextNode = this._node.getNext();
        if (nextNode) {
            var currentNodeSize = _nodeSizeForDirection.call(this, this._node);
            this._scroller.sequenceFrom(nextNode);
            this._node = nextNode;
            _shiftOrigin.call(this, -currentNodeSize);
            _setSpring.call(this, 0, SpringStates.PAGE);
        }
        return nextNode;
    };

    /**
     * Paginates the MetScrollview to an absolute page index.
     *
     * @method goToPage
     */
    MetScrollview.prototype.goToPage = function goToPage(index) {
        var currentIndex = this.getCurrentIndex();
        var i;

        if (currentIndex > index) {
            for (i = 0; i < currentIndex - index; i++)
                this.goToPreviousPage();
        }

        if (currentIndex < index) {
            for (i = 0; i < index - currentIndex; i++)
                this.goToNextPage();
        }
    };

    MetScrollview.prototype.outputFrom = function outputFrom() {
        return this._scroller.outputFrom.apply(this._scroller, arguments);
    };

    MetScrollview.prototype.setupFootprints = function (arr) {
        var array = [];
        for (var i = 0; i < arr.length; i++) {
            array.push({loc: arr[i], at: 0});
        }
        this._footprints = array;
    };

    MetScrollview.prototype.isOnTopEdge = function() {
        return this._onEdge == EdgeStates.TOP;
    };

    MetScrollview.prototype.isOnBottomEdge = function() {
        return this._onEdge == EdgeStates.BOTTOM;
    };

    MetScrollview.prototype.getViewSizeForDirection = function(){
        return _viewSizeForDirection.call(this);
    };

    MetScrollview.prototype.getContentSizeForDirection = function(){
        return _nodeSizeForDirection.call(this, this._node);
    };

    /**
     * Returns the position associated with the MetScrollview instance's current node
     *  (generally the node currently at the top).
     *
     * @deprecated
     * @method getPosition
     * @param {number} [node] If specified, returns the position of the node at that index in the
     * MetScrollview instance's currently managed collection.
     * @return {number} The position of either the specified node, or the MetScrollview's current Node,
     * in pixels translated.
     */
    MetScrollview.prototype.getPosition = function getPosition() {
        return this._particle.getPosition1D();
    };

    /**
     * Returns the absolute position associated with the MetScrollview instance
     *
     * @method getAbsolutePosition
     * @return {number} The position of the MetScrollview's current Node,
     * in pixels translated.
     */
    MetScrollview.prototype.getAbsolutePosition = function getAbsolutePosition() {
        return this._scroller.getCumulativeSize(this.getCurrentIndex())[this.options.direction] + this.getPosition();
    };

    /**
     * Returns the offset associated with the MetScrollview instance's current node
     *  (generally the node currently at the top).
     *
     * @method getOffset
     * @param {number} [node] If specified, returns the position of the node at that index in the
     * MetScrollview instance's currently managed collection.
     * @return {number} The position of either the specified node, or the MetScrollview's current Node,
     * in pixels translated.
     */
    MetScrollview.prototype.getOffset = MetScrollview.prototype.getPosition;

    /**
     * Sets the position of the physics particle that controls MetScrollview instance's "position"
     *
     * @deprecated
     * @method setPosition
     * @param {number} x The amount of pixels you want your MetScrollview to progress by.
     */
    MetScrollview.prototype.setPosition = function setPosition(x) {
        this._particle.setPosition1D(x);
        _checkFootprints.call(this);
    };

    /**
     * Sets the offset of the physics particle that controls MetScrollview instance's "position"
     *
     * @method setPosition
     * @param {number} x The amount of pixels you want your MetScrollview to progress by.
     */
    MetScrollview.prototype.setOffset = MetScrollview.prototype.setPosition;

    /**
     * Returns the MetScrollview instance's velocity.
     *
     * @method getVelocity
     * @return {Number} The velocity.
     */

    MetScrollview.prototype.getVelocity = function getVelocity() {
        return this._touchCount ? this._touchVelocity : this._particle.getVelocity1D();
    };

    /**
     * Sets the MetScrollview instance's velocity. Until affected by input or another call of setVelocity
     *  the MetScrollview instance will scroll at the passed-in velocity.
     *
     * @method setVelocity
     * @param {number} v The magnitude of the velocity.
     */
    MetScrollview.prototype.setVelocity = function setVelocity(v) {
        this._particle.setVelocity1D(v);
    };

    /**
     * Patches the MetScrollview instance's options with the passed-in ones.
     *
     * @method setOptions
     * @param {Options} options An object of configurable options for the MetScrollview instance.
     */
    MetScrollview.prototype.setOptions = function setOptions(options) {
        // preprocess custom options
        if (options.direction !== undefined) {
            if (options.direction === 'x') options.direction = Utility.Direction.X;
            else if (options.direction === 'y') options.direction = Utility.Direction.Y;
        }

        // preprocess custom options
        //if(!((options.footprints instanceof Array) && options.footprints.length > 0))
        //    options.footprinted = false;

        if (options.groupScroll !== this.options.groupScroll) {
            if (options.groupScroll)
                this.subscribe(this._scroller);
            else
                this.unsubscribe(this._scroller);
        }

        // patch custom options
        this._optionsManager.setOptions(options);

        // propagate options to sub-components

        // scroller sub-component
        this._scroller.setOptions(options);

        // physics sub-components
        if (options.drag !== undefined) this.drag.setOptions({strength: this.options.drag});
        if (options.friction !== undefined) this.friction.setOptions({strength: this.options.friction});
        if (options.edgePeriod !== undefined || options.edgeDamp !== undefined) {
            this.spring.setOptions({
                period: this.options.edgePeriod,
                dampingRatio: this.options.edgeDamp
            });
        }

        // sync sub-component
        if (options.rails || options.direction !== undefined || options.syncScale !== undefined || options.preventDefault) {
            this.sync.setOptions({
                rails: this.options.rails,
                direction: (this.options.direction === Utility.Direction.X) ? GenericSync.DIRECTION_X : GenericSync.DIRECTION_Y,
                scale: this.options.syncScale,
                preventDefault: this.options.preventDefault
            });
        }
    };

    /**
     * Sets the collection of renderables under the MetScrollview instance's control, by
     *  setting its current node to the passed in ViewSequence. If you
     *  pass in an array, the MetScrollview instance will set its node as a ViewSequence instantiated with
     *  the passed-in array.
     *
     * @method sequenceFrom
     * @param {Array|ViewSequence} node Either an array of renderables or a Famous viewSequence.
     */
    MetScrollview.prototype.sequenceFrom = function sequenceFrom(node) {
        if (node instanceof Array) node = new ViewSequence({array: node, trackSize: true});
        this._node = node;
        return this._scroller.sequenceFrom(node);
    };

    /**
     * Returns the width and the height of the MetScrollview instance.
     *
     * @method getSize
     * @return {Array} A two value array of the MetScrollview instance's current width and height (in that order).
     */
    MetScrollview.prototype.getSize = function getSize() {
        return this._scroller.getSize.apply(this._scroller, arguments);
    };

    /**
     * Generate a render spec from the contents of this component.
     *
     * @private
     * @method render
     * @return {number} Render spec for this component
     */
    MetScrollview.prototype.render = function render() {
        if (this.options.paginated && this._needsPaginationCheck)
            _handlePagination.call(this);
        else if (this.options.footprinted && this._needsFootprintCheck)
            _handleFootprint.call(this);
        return this._scroller.render();
    };

    module.exports = MetScrollview;
});