define(function(require, exports, module) {

    ///////////////////////////////////////////////////////////////////////
    //var Engine = require('famous/core/Engine');
    //var Modifier = require('famous/core/Modifier');
    //var StateModifier = require('famous/modifiers/StateModifier');
    //var Transform = require('famous/core/Transform');
    //var Surface = require('famous/core/Surface');
    //
    //var GenericSync = require('famous/inputs/GenericSync');
    //var MouseSync = require('famous/inputs/MouseSync');
    //var TouchSync = require('famous/inputs/TouchSync');
    //var Transitionable = require('famous/transitions/Transitionable');
    //
    //var options = {
    //    openPosition: -276,
    //    transition: {
    //        duration: 300,
    //        curve: 'easeOut'
    //    },
    //    posThreshold: 138,
    //    velThreshold: 0.50
    //};
    //
    //var mainContext = Engine.createContext();
    //
    //GenericSync.register({
    //    'mouse': MouseSync,
    //    'touch': TouchSync
    //});
    //
    //var currentPos = new Transitionable([0, 0]);
    //
    //var surf = new Surface({
    //    size: [300, 300],
    //    properties: {
    //        backgroundColor: '#FA5C4F',
    //        color: 'white',
    //        textAlign: 'center',
    //        fontSize: '36px',
    //        cursor: 'pointer'
    //    },
    //    content: '<< surf to the left'
    //});
    //
    //var stMod = new StateModifier({
    //    origin: [0.5, 0.5]
    //});
    //
    //var mod = new Modifier({
    //    transform: function () {
    //        var pos = currentPos.get();
    //        return Transform.translate(pos[0], pos[1], 0);
    //    }
    //});
    //
    //var sync = new GenericSync(['mouse', 'touch']);
    //surf.pipe(sync);
    //
    //// while i am dragging
    //sync.on('update', function (data) {
    //    var pos = currentPos.get();
    //    currentPos.set([pos[0] + data.delta[0], pos[1]]);
    //});
    //
    //// how/where the swipe has to end after the mouseup
    //sync.on('end', function (data) {
    //    var velocity = data.velocity[0];
    //    var pos = currentPos.get();
    //
    //    if (pos[0] > options.posThreshold) {
    //        if (velocity < -options.velThreshold) {
    //            // slide Left
    //            currentPos.set([options.openPosition, 0], options.transition);
    //        } else {
    //            // slide Right
    //            currentPos.set([0, 0], options.transition);
    //        }
    //    } else {
    //        if (velocity > options.velThreshold) {
    //            // slide Right
    //            currentPos.set([0, 0], options.transition);
    //        } else {
    //            // slide Left
    //            currentPos.set([options.openPosition, 0], options.transition);
    //        }
    //    }
    //});
    //
    //mainContext.add(stMod).add(mod).add(surf);

    ////////////////////////  COMBINE ANIMATIONS  ///////////////////////////
    //
    //var Engine = require('famous/core/Engine');
    //var Surface = require('famous/core/Surface');
    //var Modifier = require('famous/core/Modifier');
    //var Transform = require('famous/core/Transform');
    //
    //var mainContext = Engine.createContext();
    //
    //var surface = new Surface({
    //    size: [100, 50],
    //    content: 'Welcome',
    //    properties: {
    //        color: 'white',
    //        backgroundColor: '#FA5C4F'
    //    }
    //});
    //
    //var modifier = new Modifier({
    //    align: [0.5, 0.5],
    //    origin: [0.5, 0.5]
    //});
    //
    //mainContext.add(modifier).add(surface);
    //
    //var transition = {duration: 500, curve: 'easeInOut'};
    //
    //// the transforms i will use
    //var scale = Transform.scale(1.5, 1.5, 1);
    //var trans1 = Transform.translate(100, 0, 0);
    //var trans2 = Transform.rotate(0, 0, 0.5);
    //
    ////i combine the first two
    //var partial = Transform.multiply(scale, trans1);
    ////i combine the previous matrix result with the last transition i have
    ////and i execute it
    //modifier.setTransform(Transform.multiply(partial, trans2), transition);



    ////////////////rotate cube ////////////////
    //var Engine = require('famous/core/Engine');
    //var Surface = require('famous/core/Surface');
    //var Modifier = require('famous/core/Modifier');
    //var Transform = require('famous/core/Transform');
    //var Timer = require('famous/Utilities/Timer');
    //
    //var convert = Math.PI/180;
    //var matrix=[];
    //var x, y, rot, scale;
    //var rotate = [
    //    [0, 0, 0],
    //    [0, 90, 0],
    //    [0, -90, 0],
    //    [0, 0, 0],
    //    [90, 0, 0],
    //    [-90, 0, 0]
    //];
    //var size = 100;
    //var xlate = [
    //    [0, 0, size],
    //    [size, 0, 0],
    //    [-size, 0, 0],
    //    [0, 0, -size],
    //    [0, size, 0],
    //    [0, -size, 0]
    //];
    //var xlt, rot;
    //
    //function originalCube() {
    //    for (var i =0; i <6; i++) {
    //        xlt = xlate[i]
    //        rot = rotate[i];
    //        matrix.push(Transform.multiply(
    //            Transform.translate(xlt[0], xlt[1], xlt[2]),
    //            Transform.rotate(rot[0]*convert, rot[1]*convert, rot[2]*convert)))
    //
    //        _smod[i].setTransform(
    //            matrix[i], {
    //                duration:0
    //            });
    //    }
    //}
    //var rotationY =0;
    //var rotationZ = 0;
    //var matrix2;
    //function rotateCube() {
    //    for (var i = 0; i < colors.length; i++) {
    //        xlt = xlate[i];
    //        rot = rotate[i];
    //        matrix2 =Transform.rotate(0, rotationY*convert,rotationZ*convert);
    //
    //        matrix2 =
    //            Transform.multiply(
    //                matrix2,
    //                matrix[i]
    //            )
    //        callback = function(){
    //            rotationY+=0.1;
    //            rotationZ+=0.2;
    //        }
    //        _smod[i].setTransform(
    //            matrix2, {
    //                duration: 0
    //            },callback);
    //    }
    //}
    //
    ////    var StateModifier = require('famous/modifiers/StateModifier');
    //
    //var _ctx = Engine.createContext();
    //_ctx.setPerspective(5000);
    //var colors = ['red', 'blue', 'violet', 'green', 'yellow', 'aqua'];
    //var _surface = [];
    //var _smod = [];
    //for (var i = 0; i < colors.length; i++) {
    //    _surface[i] = new Surface({
    //        size: [size*2, size*2],
    //        properties: {
    //            backgroundColor: colors[i],
    //            opacity: 0.9
    //        }
    //    });
    //    _surface[i].addClass("backfaceVisibility");
    //    _smod[i] = new Modifier({
    //        origin: [0.5, 0.5]
    //    });
    //    _ctx.add(_smod[i]).add(_surface[i]);
    //}
    //originalCube();
    //Timer.setInterval(rotateCube, 20);


    //var Engine = require('famous/core/Engine');
    //var Surface = require('famous/core/Surface');
    //var Modifier = require('famous/core/Modifier');
    //var Transform = require('famous/core/Transform');
    //
    //var GridLayout = require('famous/views/GridLayout');
    //var StateModifier = require('famous/modifiers/StateModifier');
    //var RenderNode = require('famous/core/RenderNode');
    //var RenderController = require('famous/views/RenderController');
    //var Lightbox = require('famous/views/Lightbox');
    //var Easing = require('famous/transitions/Easing');
    //
    //
    //var mainContext = Engine.createContext();
    //
    //var grid = new GridLayout({
    //    dimensions: [8, 8],
    //});
    //
    //var surfaces = [];
    //
    //var showing;
    //
    //grid.sequenceFrom(surfaces);
    //
    //var cmod = new StateModifier({
    //    origin: [0.5, 0.5],
    //    align: [0.5, 0.5]
    //});
    //var controller = new Lightbox({
    //    inTransition: true,
    //    outTransition: false,
    //    overlap: true
    //});
    //controller.hide();
    //
    //function newSurface(id) {
    //    var surface = new Surface({
    //        size: [undefined, undefined],
    //        content: id + 1,
    //        properties: {
    //            backgroundColor: "hsl(" + (id * 70 / 64) + ", 60%, 70%)",
    //            lineHeight: '50px',
    //            textAlign: 'center',
    //            cursor: 'pointer'
    //        }
    //    });
    //
    //    surface._smod = new StateModifier({
    //        size: [420,420],
    //        origin: [0.5, 0.5],
    //        align: [0.5, 0.5]
    //    });
    //    surface._rnode = new RenderNode();
    //    surface._rnode.add(surface._smod).add(surface);
    //
    //    surfaces.push(surface);
    //
    //    surface.on('click', function(context, e) {
    //        if (this === showing) {
    //            controller.hide({ curve:Easing.inElastic, duration: 1000 }, function(){
    //                gridModifier.setTransform(Transform.scale(1,1,1),
    //                    { curve:Easing.outElastic, duration: 1000 });
    //            });
    //            showing = null;
    //        } else {
    //            showing = this;
    //            gridModifier.setTransform(Transform.scale(0.001, 0.001, 0.001),
    //                { curve:Easing.outCurve, duration: 300 });
    //            cmod.setTransform(Transform.translate(0, 0, 0.0001));
    //            controller.show(this._rnode, { curve:Easing.outElastic, duration: 2400 });
    //        }
    //
    //    }.bind(surface, mainContext));
    //}
    //
    //for(var i = 0; i < 64; i++) {
    //    newSurface(i);
    //}
    //
    //var gridModifier = new StateModifier({
    //    size: [400, 400],
    //    align: [0.5, 0.5],
    //    origin: [0.5, 0.5]
    //});
    //
    //mainContext.add(gridModifier).add(grid);
    //mainContext.add(cmod).add(controller);
    //mainContext.setPerspective(1000);


    //var Engine          = require('famous/core/Engine');
    //var GridLayout                = require('famous/views/GridLayout');
    //var Surface             = require('famous/core/Surface');
    //var Modifier            = require('famous/core/Modifier');
    //var StateModifier       = require('famous/modifiers/StateModifier');
    //var Draggable           = require('famous/modifiers/Draggable');
    //var Transform           = require('famous/core/Transform');
    //var ModifierChain       = require('famous/modifiers/ModifierChain');
    //var Flipper    = require("famous/views/Flipper");
    //var RenderNode     = require('famous/core/RenderNode');
    //var Easing               = require("famous/transitions/Easing");
    //var Lightbox            = require('famous/views/Lightbox');



    //var Engine = famous.core.Engine;
    //var GridLayout = famous.views.GridLayout;
    //var StateModifier = famous.modifiers.StateModifier;
    //var ModifierChain = famous.modifiers.ModifierChain;
    //var Transform = famous.core.Transform;
    //var RenderNode = famous.core.RenderNode;
    //var Easing = famous.transitions.Easing;
    //var Lightbox = famous.views.Lightbox;
    //var Flipper = famous.views.Flipper;


    //var trans = null;
    //
    //var mainContext = Engine.createContext();
    //
    //var grid = new GridLayout({
    //    dimensions: [8, 8],
    //    gutterSize: [5,5]
    //});
    //
    //var surfaces = [];
    //var flips = 0;
    //
    //grid.sequenceFrom(surfaces);
    //
    //function newSurface(id) {
    //    var surface = new Surface({
    //        content: id + 1,
    //        properties: {
    //            backgroundColor: "hsl(" + (id * 150 / 64) + ", 80%, 70%)",
    //            lineHeight: '50px',
    //            textAlign: 'center'
    //        }
    //    });
    //    var surface2 = new Surface({
    //        content: 'back',
    //        properties: {
    //            backgroundColor: "hsl(" + (id * 150 / 64) + ", 80%, 40%)",
    //            lineHeight: '50px',
    //            textAlign: 'center'
    //        }
    //    })
    //
    //    var flip = new Flipper({
    //        direction: 0
    //    });
    //    flip.setFront(surface);
    //    flip.setBack(surface2);
    //
    //    var smod = new StateModifier({
    //        //align: [.5,.5],
    //        //origin: [1,1],
    //    });
    //
    //    var rnode = new RenderNode();
    //    //rnode.add(smod).add(surface);
    //    rnode.add(flip);
    //
    //    surfaces.push(rnode);
    //
    //    surface.on('click', function() {
    //        flips += 1;
    //
    //        if (flips == 1) {
    //            gridModifier.setTransform(Transform.scale(.5,.5,.5), { curve:Easing.outElastic, duration: 800 })
    //        }
    //        smod.setTransform(Transform.scale(1.5,1.5,1.5), { curve:Easing.outElastic, duration: 1000 })
    //        flip.flip();
    //    });
    //    surface2.on('click', function(){
    //        flip.flip();
    //        smod.setTransform(Transform.translate(0,0,0), { curve:Easing.outElastic, duration: 1000 })
    //        flips -= 1;
    //        if (flips == 0) {
    //            gridModifier.setTransform(Transform.rotate(0,0,100), { curve:Easing.outElastic, duration: 400 })
    //        }
    //    })
    //}
    //
    //for(var i = 0; i < 64; i++) {
    //    newSurface(i);
    //}
    //
    //var gridModifier = new StateModifier({
    //    size: [500, 500],
    //    align: [0, 0],
    //    origin: [0, 0],
    //});
    //
    ////var gridRotate = new StateModifier({
    ////    transform : Transform.rotate(0,0,0),
    ////});
    ////
    ////var lightbox = new Lightbox({
    ////    inTransition: true,
    ////    outTransition: true,
    ////    overlap: true
    ////});
    //
    //
    //mainContext.add(gridModifier).add(grid);
    //
    //mainContext.setPerspective(3000);


    ////http://stackoverflow.com/questions/27714976/famo-us-access-to-collisiondata-upon-collision-event

    //var Engine = require('famous/core/Engine');
    //var Surface = require('famous/core/Surface');
    //var ImageSurface = require('famous/surfaces/ImageSurface');
    //var RenderNode = require('famous/core/RenderNode');
    //var View = require('famous/core/View');
    //var Transform = require('famous/core/Transform');
    //var StateModifier = require('famous/modifiers/StateModifier');
    //var Modifier = require('famous/core/Modifier');
    //
    //var PhysicsEngine = require('famous/physics/PhysicsEngine');
    //var Force = require('famous/physics/forces/Force');
    //var Body = require('famous/physics/bodies/Body');
    //var Circle = require('famous/physics/bodies/Circle');
    //var Wall = require('famous/physics/constraints/Wall');
    //var Vector = require('famous/math/Vector');
    //var Collision = require('famous/physics/constraints/Collision');
    //
    //var context = Engine.createContext();
    //context.setPerspective(1000);
    //
    //var collision = new Collision();
    //collision.on('collision', function(data){
    //    console.log('target', data.target.uniqueID, 'bumped source', data.source.uniqueID);
    //    console.log('target surface', data.target.surface);
    //    console.log('source surface', data.source.surface);
    //    data.source.surface.setOptions({
    //        properties: {backgroundColor: 'blue'}
    //    });
    //    data.target.surface.setOptions({
    //        properties: {backgroundColor: 'red'}
    //    });
    //});
    //var physicsOrigin = [0.5, 0.5];
    //
    //colourPallete = ['#000', '#000', '#000'];
    //
    //var node = new RenderNode();
    //var physicsEngine = new PhysicsEngine();
    //
    //var dimX;
    //var dimY;
    //
    //var surface = new Surface({
    //    content: 'Click to set Body in motion. On collision, target will set backround RED and source will be BLUE',
    //    size: [undefined, undefined],
    //    properties: {
    //        backgroundColor: 'rgba(0, 126, 0, 0.15)'
    //    }
    //});
    //context.add(new Modifier({
    //    align: physicsOrigin,
    //    origin: physicsOrigin
    //})).add(node);
    //context.add(surface);
    //node.add(physicsEngine);
    //
    //surface.on('click', function (event) {
    //    console.log('x ' + event.clientX);
    //    console.log('y ' + event.clientY);
    //    var x = event.clientX - (dimX * physicsOrigin[0]);
    //    var y = event.clientY - (dimY * physicsOrigin[1]);
    //    var cBall = createBall;
    //    setTimeout(function () {
    //        createBall(x, y);
    //    }, 0);
    //
    //});
    //
    //var balls = [];
    //
    //var gravity = new Force([0, 0.00025, 0]);
    //
    //Engine.nextTick(function(){
    //    var size = context.getSize();
    //    console.log('After tick=' + size);
    //    dimX = size[0];
    //    dimY = size[1];
    //
    //    var leftWall = new Wall({
    //        normal: [1, 0, 0],
    //        distance: Math.round(dimX / 2.0),
    //        restitution: 0.5
    //    });
    //    var rightWall = new Wall({
    //        normal: [-1, 0, 0],
    //        distance: Math.round(dimX / 2.0),
    //        restitution: 0.5
    //    });
    //    var topWall = new Wall({
    //        normal: [0, 1, 0],
    //        distance: Math.round(dimY / 2.0),
    //        restitution: 0.5
    //    });
    //    var bottomWall = new Wall({
    //        normal: [0, -1, 0],
    //        distance: Math.round(dimY / 2.0),
    //        restitution: 0.5
    //    });
    //
    //    physicsEngine.attach([leftWall, rightWall, topWall, bottomWall], balls);
    //
    //});
    //
    //
    //function setGravity() {
    //    //gravity.applyForce(this);
    //    return this.getTransform();
    //}
    //
    //var uniqueID = 0;
    //function createBall(x, y) {
    //    var radius = (Math.random() * 48) + 12;
    //    var colour = Math.floor((Math.random() * 3));
    //    var ball = new ImageSurface({
    //        content: 'http://code.famo.us/assets/famous_logo.svg',
    //        size: [radius * 2, radius * 2],
    //        properties: {
    //            borderRadius: (radius * 2) + 'px'
    //        }
    //    });
    //    ball.particle = new Circle({
    //        radius: radius,
    //        position: [x, y, 0]
    //    });
    //    ball.particle.uniqueID = 'particle' + uniqueID;
    //    ball.particle.surface = ball;
    //    uniqueID += 1;
    //    physicsEngine.addBody(ball.particle);
    //    physicsEngine.attach(collision, balls, ball.particle);
    //    ball.state = new Modifier();
    //    ball.state.transformFrom(setGravity.bind(ball.particle));
    //    node.add(ball.state).add(ball);
    //    ball.sleeping = false;
    //    ball.on("click", function () {
    //        console.log('clicked ball');
    //        physicsEngine.removeBody(this.particle);
    //    });
    //
    //    balls.push(ball.particle);
    //    ball.particle.setVelocity([(Math.random() * 4) - 2, (Math.random() * 4) - 2, 0]);
    //}



    ///////////////////implement google paper button effects
    /////////http://stackoverflow.com/questions/24946191/how-to-implement-google-paper-button-effects
    //var Surface = require('famous/core/Surface');
    //var Timer = require('famous/utilities/Timer');
    //var Transitionable = require('famous/transitions/Transitionable');
    //
    //// Extend the button surface to tap into .render()
    //function RippleSurface(options) {
    //    Surface.apply(this, arguments);
    //
    //    this.gradientOpacity = new Transitionable(0);
    //    this.gradientRadius = new Transitionable(0);
    //
    //    // Use light or dark gradient?
    //    if (options.tint === 'light') {
    //        // radiate light to dark
    //        this.firstStop = '255,255,255';
    //    } else {
    //        // radiate dark to light by default
    //        this.firstStop = '0,0,0';
    //    }
    //
    //    // Hold on to offsetX/Y throughout render loop during transition
    //    this.offsetX = 0;
    //    this.offsetY = 0;
    //
    //    this.on('mousedown', this.ripple);
    //    this.on('mouseup', this.smooth);
    //    this.on('mouseleave', this.smooth);
    //
    //    this.on('deploy', this.postDeploy);
    //}
    //
    //RippleSurface.prototype = Object.create(Surface.prototype);
    //RippleSurface.prototype.constructor = RippleSurface;
    //
    //RippleSurface.prototype.postDeploy = function () {
    //    // Have to do this here in order to account for undefined or boolean sizes
    //    var width = (typeof this.size[0] === 'number') ? this.size[0] : this._currTarget.clientWidth;
    //    var height = (typeof this.size[1] === 'number') ? this.size[1] : this._currTarget.clientHeight;
    //
    //    // Maximum radius large enough to cover the surface from corner to corner
    //    this.gradientMaxRadius = Math.round(Math.sqrt(width * width + height * height));
    //
    //    // Based on "feels good" numbers of growing 100px in 300 milliseconds
    //    this.gradientDuration = (this.gradientMaxRadius / 100) * 300;
    //};
    //
    //RippleSurface.prototype.render = function () {
    //    var gradientOpacity = this.gradientOpacity.get();
    //    var gradientRadius = this.gradientRadius.get();
    //
    //    // My apologies for this. Interpolation is coming in ECMAScript 6!
    //    this.setProperties({
    //        backgroundImage: 'radial-gradient(circle at ' + this.offsetX + ' ' + this.offsetY + ', rgba(' + this.firstStop + ',' + gradientOpacity + '), rgba(' + this.firstStop + ',' + gradientOpacity + ') ' + gradientRadius + 'px, rgba(0,0,0,0) ' + gradientRadius + 'px)'
    //    });
    //
    //    // return what Surface expects
    //    return this.id;
    //};
    //
    //RippleSurface.prototype.ripple = function (data) {
    //    this.offsetX = (data.offsetX || data.layerX) + 'px';
    //    this.offsetY = (data.offsetY || data.layerY) + 'px';
    //
    //    this.gradientOpacity.set(0.1);
    //    this.gradientRadius.set(0);
    //    this.gradientRadius.set(this.gradientMaxRadius, {
    //        duration: this.gradientDuration,
    //        curve: 'easeOut'
    //    });
    //};
    //
    //RippleSurface.prototype.smooth = function (data) {
    //    this.gradientOpacity.set(0, {
    //        duration: 300,
    //        curve: 'easeOut'
    //    });
    //};
    //
    ////module.exports = RippleSurface;
    //
    //
    //var Engine = require('famous/core/Engine');
    //var StateModifier = require('famous/modifiers/StateModifier');
    //var Transform = require('famous/core/Transform');
    //
    ////var RippleSurface = require('RippleSurface');
    //
    //var mainContext = Engine.createContext();
    //
    //// Test light tint
    //var surface = new RippleSurface({
    //    content: 'Primary',
    //    size: [150, 44],
    //    tint: 'light',
    //    properties: {
    //        fontFamily: 'Helvetica Neue',
    //        fontSize: '18px',
    //        fontWeight: '300',
    //        textAlign: 'center',
    //        lineHeight: '44px',
    //        background: '#3799dc'
    //    }
    //});
    //
    //var modifier = new StateModifier({
    //    transform: Transform.translate(50, 50, 0)
    //});
    //
    //// Test dark tint
    //var surface2 = new RippleSurface({
    //    content: 'Secondary',
    //    size: [150, 44],
    //    properties: {
    //        fontFamily: 'Helvetica Neue',
    //        fontSize: '18px',
    //        fontWeight: '300',
    //        textAlign: 'center',
    //        lineHeight: '44px',
    //        background: '#ecf0f1'
    //    }
    //});
    //
    //var modifier2 = new StateModifier({
    //    transform: Transform.translate(250, 50, 0)
    //});
    //
    //// Test undefined and boolean sizes
    //var surface3 = new RippleSurface({
    //    content: 'Big Button',
    //    size: [undefined, true],
    //    properties: {
    //        fontFamily: 'Helvetica Neue',
    //        fontSize: '18px',
    //        fontWeight: '300',
    //        textAlign: 'center',
    //        lineHeight: '150px',
    //        background: '#1abc9c'
    //    }
    //});
    //
    //var modifier3 = new StateModifier({
    //    size: [150, 150],
    //    transform: Transform.translate(450, 50, 0)
    //});
    //
    //// Test timing
    //var surface4 = new RippleSurface({
    //    content: 'Long Button',
    //    size: [400, 44],
    //    properties: {
    //        fontFamily: 'Helvetica Neue',
    //        fontSize: '18px',
    //        fontWeight: '300',
    //        textAlign: 'center',
    //        lineHeight: '44px',
    //        background: '#e74c3c'
    //    }
    //});
    //
    //var modifier4 = new StateModifier({
    //    transform: Transform.translate(50, 250, 0)
    //});
    //
    //
    //mainContext.add(modifier).add(surface);
    //mainContext.add(modifier2).add(surface2);
    //mainContext.add(modifier3).add(surface3);
    //mainContext.add(modifier4).add(surface4);


    ///light box/////////////
    //var Engine = require('famous/core/Engine');
    //var Surface = require('famous/core/Surface');
    //var GridLayout = require('famous/views/GridLayout');
    //var StateModifier = require('famous/modifiers/StateModifier');
    //var Transform = require('famous/core/Transform');
    //var RenderNode = require('famous/core/RenderNode');
    //var RenderController = require('famous/views/RenderController');
    //var Lightbox = require('famous/views/Lightbox');
    //var Easing = require('famous/transitions/Easing');
    //
    //var mainContext = Engine.createContext();
    //
    //var grid = new GridLayout({
    //    dimensions: [8, 8],
    //});
    //
    //var surfaces = [];
    //
    //var showing;
    //
    //grid.sequenceFrom(surfaces);
    //
    //var cmod = new StateModifier({
    //    origin: [0.5, 0.5],
    //    align: [0.5, 0.5]
    //});
    //var controller = new Lightbox({
    //    inTransition: true,
    //    outTransition: false,
    //    overlap: true
    //});
    //controller.hide();
    //
    //function newSurface(id) {
    //    var surface = new Surface({
    //        size: [undefined, undefined],
    //        content: id + 1,
    //        properties: {
    //            backgroundColor: "hsl(" + (id * 70 / 64) + ", 60%, 70%)",
    //            lineHeight: '50px',
    //            textAlign: 'center',
    //            cursor: 'pointer'
    //        }
    //    });
    //
    //    surface._smod = new StateModifier({
    //        size: [420,420],
    //        origin: [0.5, 0.5],
    //        align: [0.5, 0.5]
    //    });
    //    surface._rnode = new RenderNode();
    //    surface._rnode.add(surface._smod).add(surface);
    //
    //    surfaces.push(surface);
    //
    //    surface.on('click', function(context, e) {
    //        if (this === showing) {
    //            controller.hide({ curve:Easing.inElastic, duration: 1000 }, function(){
    //                gridModifier.setTransform(Transform.scale(1,1,1),
    //                    { curve:Easing.outElastic, duration: 1000 });
    //            });
    //            showing = null;
    //        } else {
    //            showing = this;
    //            gridModifier.setTransform(Transform.scale(0.001, 0.001, 0.001),
    //                { curve:Easing.outCurve, duration: 300 });
    //            cmod.setTransform(Transform.translate(0, 0, 0.0001));
    //            controller.show(this._rnode, { curve:Easing.outElastic, duration: 2400 });
    //        }
    //
    //    }.bind(surface, mainContext));
    //}
    //
    //for(var i = 0; i < 64; i++) {
    //    newSurface(i);
    //}
    //
    //var gridModifier = new StateModifier({
    //    size: [400, 400],
    //    align: [0.5, 0.5],
    //    origin: [0.5, 0.5]
    //});
    //
    //mainContext.add(gridModifier).add(grid);
    //mainContext.add(cmod).add(controller);
    //mainContext.setPerspective(1000);

    ////draggable pos////
    //http://stackoverflow.com/questions/26193020/famo-us-get-the-new-position-of-a-draggable-surface

    var Engine = require('famous/core/Engine');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var Modifier = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Draggable = require('famous/modifiers/Draggable');
    var TransitionableTransform = require('famous/transitions/TransitionableTransform');

    var mainContext = Engine.createContext();

    var transTransform = new TransitionableTransform();
    transTransform.set(Transform.translate(100, 0, 0));

    var surface = new Surface({
        size: [300, 100],
        properties: {
            backgroundColor: 'rgba(255,0,0,0.1)',
            cursor: 'pointer'
        }
    });

    var dragSurface = new Surface({
        content: 'Drag Me',
        size: [100, 100],
        properties: {
            backgroundColor: 'rgba(0,0,0,0.1)',
            cursor: 'pointer'
        }
    });

    var modifier = new Modifier({
        origin: [0, 0],
        align: [0, 0],
        transform: transTransform
    });

    var draggable = new Draggable();

    draggable.subscribe(dragSurface);

    var content = 'Not Draggable';
    surface.setContent(content);

    mainContext.add(modifier).add(surface);
    mainContext.add(draggable).add(dragSurface);

    draggable.on('update', function (e) {
        var pos = e.position;
        surface.setContent('Draggable Position is '+pos);
        transTransform.set(Transform.translate(pos[0]+100, pos[1], 0));
    })

    draggable.on('end', function (e) {
        var pos = e.position;
        surface.setContent('Draggable End Position is '+pos);
        transTransform.set(Transform.translate(pos[0]+100, pos[1], 0));
    })

    /**************************************
     ************ Attribution :)
     **************************************/

    var desc = new Surface({
        content:'<a href="http://stackoverflow.com/users/2597114/talves"><img src="http://stackoverflow.com/users/flair/2597114.png" width="208" height="58" alt="profile for talves at Stack Overflow" title="profile for talves at Stack Overflow"></a>',
        classes: ['double-sided', 'double-font'],
        properties: {
            textAlign: 'center',
            lineHeight: '80px'
        }
    });

    desc._mod = new Modifier({
        size: [200, 20],
        align: [0.5, 1],
        origin: [0, 0],
        transform: Transform.translate(-100, -100, 0)
    });

    mainContext.add(desc._mod).add(desc);
});
