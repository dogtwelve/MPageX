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

    //////draggable pos////
    ////http://stackoverflow.com/questions/26193020/famo-us-get-the-new-position-of-a-draggable-surface
    //
    //var Engine = require('famous/core/Engine');
    //var Surface = require('famous/core/Surface');
    //var Transform = require('famous/core/Transform');
    //var Modifier = require('famous/core/Modifier');
    //var StateModifier = require('famous/modifiers/StateModifier');
    //var Draggable = require('famous/modifiers/Draggable');
    //var TransitionableTransform = require('famous/transitions/TransitionableTransform');
    //
    //var mainContext = Engine.createContext();
    //
    //var transTransform = new TransitionableTransform();
    //transTransform.set(Transform.translate(100, 0, 0));
    //
    //var surface = new Surface({
    //    size: [300, 100],
    //    properties: {
    //        backgroundColor: 'rgba(255,0,0,0.1)',
    //        cursor: 'pointer'
    //    }
    //});
    //
    //var dragSurface = new Surface({
    //    content: 'Drag Me',
    //    size: [100, 100],
    //    properties: {
    //        backgroundColor: 'rgba(0,0,0,0.1)',
    //        cursor: 'pointer'
    //    }
    //});
    //
    //var modifier = new Modifier({
    //    origin: [0, 0],
    //    align: [0, 0],
    //    transform: transTransform
    //});
    //
    //var draggable = new Draggable();
    //
    //draggable.subscribe(dragSurface);
    //
    //var content = 'Not Draggable';
    //surface.setContent(content);
    //
    //mainContext.add(modifier).add(surface);
    //mainContext.add(draggable).add(dragSurface);
    //
    //draggable.on('update', function (e) {
    //    var pos = e.position;
    //    surface.setContent('Draggable Position is '+pos);
    //    transTransform.set(Transform.translate(pos[0]+100, pos[1], 0));
    //})
    //
    //draggable.on('end', function (e) {
    //    var pos = e.position;
    //    surface.setContent('Draggable End Position is '+pos);
    //    transTransform.set(Transform.translate(pos[0]+100, pos[1], 0));
    //})
    //
    ///**************************************
    // ************ Attribution :)
    // **************************************/
    //
    //var desc = new Surface({
    //    content:'<a href="http://stackoverflow.com/users/2597114/talves"><img src="http://stackoverflow.com/users/flair/2597114.png" width="208" height="58" alt="profile for talves at Stack Overflow" title="profile for talves at Stack Overflow"></a>',
    //    classes: ['double-sided', 'double-font'],
    //    properties: {
    //        textAlign: 'center',
    //        lineHeight: '80px'
    //    }
    //});
    //
    //desc._mod = new Modifier({
    //    size: [200, 20],
    //    align: [0.5, 1],
    //    origin: [0, 0],
    //    transform: Transform.translate(-100, -100, 0)
    //});
    //
    //mainContext.add(desc._mod).add(desc);

    //////Animating blur with the famous framework///
    ////http://stackoverflow.com/questions/23295895/animating-blur-with-the-famous-framework
    //var Engine            = require('famous/core/Engine');
    //var Surface           = require('famous/core/Surface');
    //var StateModifier     = require('famous/modifiers/StateModifier');
    //var Transitionable    = require('famous/transitions/Transitionable');
    //var SnapTransition    = require('famous/transitions/SnapTransition');
    //
    //Transitionable.registerMethod('snap', SnapTransition);
    //
    //var snap   = { method :'snap',  period: 400,  dampingRatio: 0.7   };
    //
    //var context = Engine.createContext();
    //
    //var surface = new Surface({
    //    size: [200,200],
    //    properties: {
    //        backgroundColor: 'red'
    //    }
    //});
    //
    //var transitionable;
    //var final_pos;
    //
    //var blurred = false;
    //
    //var blur_from_to = function(i,f,transition){
    //
    //    var initial_pos = i;
    //    final_pos = f;
    //
    //    transitionable = new Transitionable(initial_pos);
    //
    //    transitionable.set(final_pos, transition);
    //
    //    Engine.on('prerender', prerender);
    //}
    //
    //var prerender = function(){
    //
    //    current_pos = transitionable.get();
    //
    //    var blur_string = 'blur('+ current_pos + 'px)';
    //
    //    surface.setProperties({ webkitFilter:blur_string});
    //
    //    if (current_pos == final_pos) {
    //        Engine.removeListener('prerender',prerender);
    //    };
    //}
    //
    //surface.on("click", function(){
    //
    //    blurred ? blur_from_to(10,0,snap) : blur_from_to(0,10,snap) ;
    //    blurred = !blurred;
    //
    //} );
    //
    //context.add(new StateModifier({origin:[0.5,0.5]})).add(surface);


    //////draw a line
    ////http://stackoverflow.com/questions/26886424/how-to-simply-draw-a-line-in-famo-us
    //var Engine = require('famous/core/Engine');
    //var OptionsManager = require('famous/core/OptionsManager');
    //var Surface = require('famous/core/Surface');
    //// var ImageSurface = require('famous/surfaces/ImageSurface');
    //// var InputSurface = require('famous/surfaces/InputSurface');
    //
    //// var StateModifier = require('famous/modifiers/StateModifier');
    //var Modifier = require('famous/core/Modifier');
    //var RenderNode = require('famous/core/RenderNode');
    //var Transform = require('famous/core/Transform');
    //
    //// var Transitionable = require('famous/transitions/Transitionable');
    //// var GenericSync = require('famous/inputs/GenericSync');
    //// var MouseSync = require('famous/inputs/MouseSync');
    //// var TouchSync = require('famous/inputs/TouchSync');
    //
    //var mainContext = Engine.createContext();
    //mainContext.setPerspective(1000);
    //
    //var splash = new Surface({ content: 'Famo.us Application'});
    //
    //var line = new Surface({
    //    size:[80,1],
    //    classes: ['double-sided'],
    //    properties: {
    //        backgroundColor: 'rgba(0,0,0,1.0)',
    //        cursor: 'pointer'
    //    }
    //});
    //
    //mainContext.add(splash);
    //
    //var initialTime = Date.now();
    //var centerSpinModifier = new Modifier({
    //    origin: [0, 0],
    //    align: [0.5, 0.5],
    //    transform: function() {
    //        var radians = 0.001 * (Date.now() - initialTime);
    //        return Transform.rotateAxis([0,0,1], radians);
    //    }
    //});
    //
    //var angle = 45;
    //var angleModifier = new Modifier({
    //    origin: [0, 0],
    //    align: [0.5, 0.5],
    //    transform: function() {
    //        var radians = Math.PI/180 * angle;
    //        return Transform.rotateAxis([0,0,1], radians);
    //    }
    //});
    //
    //mainContext.add(angleModifier).add(line);
    //
    //var centerModifier = new Modifier({
    //    origin: [0.5, 0.5],
    //    align: [0.5, 0.5]
    //});
    //var centerCircle = new Surface({
    //    origin: [0.5, 0.5],
    //    align: [0.5, 0.5],
    //    size: [20,20],
    //    properties: {
    //        borderRadius: '10px',
    //        backgroundColor: 'rgba(255,0,0,0.25)'
    //    }
    //});
    //
    //mainContext.add(centerModifier).add(centerCircle);

    ////Famo.us Transition Button (ripple)  registerProperty
    //////jsfiddle.net/sunrising/U3eLc/light
    //var Engine = require('famous/core/Engine');
    //var Surface = require('famous/core/Surface');
    //var StateModifier = require('famous/modifiers/StateModifier');
    //var Transitionable = require('famous/transitions/Transitionable');
    //var SnapTransition = require('famous/transitions/SnapTransition');
    //
    //Transitionable.registerMethod('snap', SnapTransition);
    //
    //var snap = {
    //    method: 'snap',
    //    period: 400,
    //    dampingRatio: 0.1
    //};
    //var snap2 = {
    //    method: 'snap',
    //    period: 200,
    //    dampingRatio: 1
    //};
    //
    //var context = Engine.createContext();
    //
    //function PropertyTransitionable() {
    //    this._trans = {};
    //    this._fns = {};
    //    this._renders = {};
    //}
    //
    //PropertyTransitionable.prototype.constructor = PropertyTransitionable;
    //
    //PropertyTransitionable.prototype.registerProperty = function (property, initial, fn) {
    //    this._fns[property] = fn;
    //    this._trans[property] = new Transitionable(initial);
    //
    //    var propertyUpper = 'set' + property[0].toUpperCase() + property.substr(1);
    //
    //    this[propertyUpper] = function (object, value, transition, callback) {
    //
    //        var existing = this._renders[property];
    //
    //        if (existing) Engine.removeListener('prerender', existing);
    //
    //        this._renders[property] = function () {
    //            var currentPos = this._trans[property].get();
    //            var calculated = this._fns[property](currentPos);
    //            var properties = {};
    //
    //            properties[property] = calculated;
    //
    //            object.setProperties(properties);
    //        }.bind(this);
    //
    //        this._trans[property].halt();
    //
    //        this._trans[property].set(value, transition, function () {
    //            Engine.removeListener('prerender', this._renders[property]);
    //            if (callback) callback();
    //        }.bind(this));
    //
    //        Engine.on('prerender', this._renders[property]);
    //    }.bind(this);
    //};
    //
    //PropertyTransitionable.DEFAULT_OPTIONS = {};
    //
    //var surface = new Surface({
    //    size: [200, 200],
    //    content: 'Click me!',
    //    properties: {
    //        backgroundColor: 'rgb(0,255,0)',
    //        fontSize: "14px",
    //        lineHeight: "190px",
    //        fontFamily: "arial",
    //        textAlign: 'center',
    //        webkitUserSelect: 'none'
    //    }
    //});
    //
    //var state = false;
    //
    //var propertyTransitionable = new PropertyTransitionable();
    //
    //propertyTransitionable.registerProperty('borderRadius', 0, function (value) {
    //    return Math.round(value) + '%';
    //});
    //
    //
    //propertyTransitionable.registerProperty('border', 0, function (value) {
    //    return Math.round(value) + 'px solid black';
    //});
    //
    //propertyTransitionable.registerProperty('backgroundColor', 0, function (value) {
    //    var rounded = Math.round(value);
    //    return 'rgb(' + rounded + ',' + (255 - rounded) + ',0)';
    //});
    //
    //propertyTransitionable.registerProperty('boxShadow', 0, function (value) {
    //    var rounded = Math.round(value);
    //    var string = '0px ' + rounded + 'px ' + rounded + 'px rgba(0,0,0,0.5), ';
    //    string += 'inset 0px ' + rounded + 'px ' + rounded + 'px rgba(255,255,255,0.5), ';
    //    string += 'inset 0px ' + -rounded + 'px ' + rounded + 'px rgba(0,0,0,0.5)  ';
    //    return string;
    //});
    //
    //propertyTransitionable.registerProperty('fontSize', 14, function (value) {
    //    return Math.round(value) + 'px';
    //});
    //
    //propertyTransitionable.registerProperty('color', 0, function (value) {
    //    var rounded = Math.round(value);
    //    return 'rgb(' + rounded + ',' + rounded + ',' + rounded + ')';
    //});
    //
    //surface.on('click', function () {
    //
    //    if (state) {
    //        propertyTransitionable.setBorderRadius(surface, 0, snap2);
    //        propertyTransitionable.setBorder(surface, 0, snap2);
    //        propertyTransitionable.setBackgroundColor(surface, 0, snap2);
    //        propertyTransitionable.setBoxShadow(surface, 0, snap2);
    //        propertyTransitionable.setFontSize(surface, 14, snap2);
    //        propertyTransitionable.setColor(surface, 0, snap2);
    //    } else {
    //        propertyTransitionable.setBorderRadius(surface, 50, snap);
    //        propertyTransitionable.setBorder(surface, 8, snap);
    //        propertyTransitionable.setBackgroundColor(surface, 255, snap);
    //        propertyTransitionable.setBoxShadow(surface, 20, snap);
    //        propertyTransitionable.setFontSize(surface, 36, snap);
    //        propertyTransitionable.setColor(surface, 255, snap);
    //    }
    //
    //    state = !state;
    //});
    //
    //context.add(new StateModifier({
    //    align: [0.5,0.5],
    //    origin: [0.5, 0.5]
    //})).add(surface);
    //
    //module.exports = null;

    /////Button with “ripple effect” in Famo.us !
    //// Import additional modules to be used in this view
    //var Engine          = require('famous/core/Engine');
    //var View = require('famous/core/View');
    //var Surface = require('famous/core/Surface');
    //var Transform = require('famous/core/Transform');
    //var StateModifier = require('famous/modifiers/StateModifier');
    //var Lightbox        = require('famous/views/Lightbox');
    //var Easing          = require('famous/transitions/Easing');
    //
    //
    //// Constructor function for our class
    //function AppView() {
    //    // Applies View's constructor function to class
    //    View.apply(this, arguments);
    //
    //    // this.options.size is created from any options passed
    //    // in during instantiation and the default options:
    //    // When the constructor function runs, it sets
    //    // .options property to the values specified in
    //    // .DEFAULT_OPTIONS and then overwrites them
    //    // with the values passed in during construction via
    //    // (this, arguments),
    //    // eg. getting called by:
    //    // var slideView = new SlideView({size: [100, 100]});
    //    this.rootModifier = new StateModifier({
    //        size: this.options.backgroundSize,
    //        origin: [0.5, 0.5]
    //    });
    //
    //    this.mainNode = this.add(this.rootModifier);
    //
    //    // make sure you invoke the helper function
    //    // in the right context by using .call()
    //    _createBackground.call(this);
    //
    //    // one inital animation - just for demo...
    //    this.rippleSpot.lightbox.show(this.rippleSpot);
    //    setTimeout(function(){
    //        this.rippleSpot.lightbox.hide();
    //    }.bind(this), 300);
    //
    //    // main event listener => buttons emit their events to this handler
    //    this.on('click', function(e) {
    //        this.doRipple(e);
    //    });
    //
    //}
    //
    //// Establishes prototype chain for class to inherit from View
    //AppView.prototype = Object.create(View.prototype);
    //AppView.prototype.constructor = AppView;
    //
    //// Default options for class, eg. the size properties
    //AppView.DEFAULT_OPTIONS = {
    //    backgroundSize: [400, 400],
    //    maxRippleSpotSize: [400, 400]
    //};
    //
    //
    //
    //// Define your helper functions and prototype methods here:
    //// the _ before the function name indicates it's
    ////a private function
    //function _createBackground() {
    //
    //    this.mainView = new View();
    //
    //    // .backgroundSurface - class is required to calculate positions!
    //    this.backgroundSurface = new Surface({
    //        content: 'click me',
    //        classes: ['backgroundSurface'],
    //        properties: {
    //            color: 'white',
    //            textAlign: 'center',
    //            fontSize: '30px',
    //            lineHeight: '100px',
    //            backgroundColor: '#FA5C4F',
    //            boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.5)'
    //        }
    //    });
    //
    //    this.mainView.add(this.backgroundSurface);
    //
    //    // click handler for clicking on red background
    //    this.backgroundSurface.on('click', function(e) {
    //        console.log ("red background clicked");
    //        // sends 'click'-event to view's output => triggers ripple-effect
    //        this._eventOutput.emit('click', e);
    //    }.bind(this));
    //
    //
    //    // 2nd surface to check event-handling
    //    this.greenButton = new Surface({
    //        size: [200,50],
    //        content: 'BUTTON',
    //        properties: {
    //            color: 'white',
    //            textAlign: 'center',
    //            fontSize: '15px',
    //            lineHeight: '50px',
    //            backgroundColor: 'green',
    //            boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.5)'
    //        }
    //    });
    //    this.mainView
    //        .add(new StateModifier({transform: Transform.translate(100, 200, 0)}))
    //        .add(this.greenButton);
    //
    //
    //    // click handler for green button
    //    this.greenButton.on('click', function(e) {
    //        console.log ("green button clicked");
    //        // sends 'click'-event to view's output => triggers ripple-effect
    //        this._eventOutput.emit('click', e);
    //    }.bind(this));
    //
    //
    //    // surface for ripple animation (white circle)
    //    this.rippleSpot = new Surface({
    //        size: this.options.maxRippleSpotSize,
    //        properties: {
    //            backgroundColor: 'white',
    //            borderRadius: (this.options.maxRippleSpotSize[0]/2) + 'px',
    //            boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.5)'
    //        }
    //    });
    //    this.rippleSpotModifier = new StateModifier({
    //        transform: Transform.translate(0, 0, 0)
    //    });
    //
    //    // lightbox with transitions for the ripple animation
    //    this.rippleSpot.lightbox = new Lightbox({
    //        //for transition parameters see http://famo.us/university/famous-101/slideshow/24/
    //        inTransform: Transform.scale(0.1, 0.1, 1),
    //        inTransition: {duration:300, curve:Easing.linear},
    //        inOpacity: 0.3,
    //        showOpacity: 0,
    //        outOpacity: 0,
    //        outTransform: Transform.scale(0.05, 0.05, 1),
    //        outTransition: {duration:10, curve:Easing.linear}
    //    });
    //
    //    // add ripple to view
    //    this.mainView.add(this.rippleSpotModifier).add(this.rippleSpot.lightbox);
    //    // add view to app
    //    this.mainNode.add(this.mainView);
    //
    //
    //}
    //
    //
    //// Start ripplin'...
    //AppView.prototype.doRipple = function(e) {
    //
    //    // select backgroundSurface and read css 3d-matrix to calcluate position
    //    var matrixElement = document.getElementsByClassName('backgroundSurface')[0].style;
    //    var matrix3d =  matrixElement.getPropertyValue('transform')
    //        || matrixElement.getPropertyValue('-moz-transform')
    //        || matrixElement.getPropertyValue('-webkit-transform')
    //        || matrixElement.getPropertyValue('-ms-transform')
    //        || matrixElement.getPropertyValue('-o-transform');
    //    // parse css value of 3d-matrix (regex)
    //    var matrixPattern = /^\w*\((((\d+)|(\d*\.\d+)),\s*)*((\d+)|(\d*\.\d+))\)/i;
    //    var matrixValue = [];
    //    if (matrixPattern.test(matrix3d)) {
    //        // only continue if pattern matches / correct 3d-matrix-value was found
    //        var matrixCopy = matrix3d.replace(/^\w*\(/, '').replace(')', '');
    //        // finally: store 3d matrix in array
    //        matrixValue = matrixCopy.split(/\s*,\s*/);
    //
    //        // x/y-position of the background Surface
    //        var deltaX = matrixValue[12];
    //        var deltaY = matrixValue[13];
    //
    //        this.backgroundSurface.setContent('x: ' + e.x + ' / y: ' + e.y);
    //        // calculate new position for transform of rippleSpot surface
    //        this.rippleSpotModifier.setTransform(Transform.translate(
    //            e.x - deltaX - this.options.backgroundSize[0]/2,
    //            e.y - deltaY - this.options.backgroundSize[1]/2,
    //            0));
    //        this.rippleSpot.lightbox.show(this.rippleSpot);
    //        // after end of transform hide rippleSport surface
    //        // hack? no callback-solution for this found
    //        setTimeout(function(){
    //            this.rippleSpot.lightbox.hide();
    //        }.bind(this), 300); // 300ms - same as duration of transform!
    //    }
    //
    //};
    //
    //
    //
    //var mainContext = Engine.createContext();
    ////// Custom Modules
    ////var AppView         = require('AppView');
    //
    //var appView   = new AppView();
    //mainContext.add(appView);

    //////Drag a Famous surface and have it transition back to origin on mouseup
    ////http://stackoverflow.com/questions/23129805/drag-a-famous-surface-and-have-it-transition-back-to-origin-on-mouseup
    //
    //var Engine              = require("famous/core/Engine");
    //var Surface             = require("famous/core/Surface");
    ////var Modifier             = require("famous/core/Modifier");
    //var StateModifier       = require("famous/modifiers/StateModifier");
    //var Draggable           = require("famous/modifiers/Draggable");
    //var Transform           = require("famous/core/Transform");
    //var Transitionable      = require("famous/transitions/Transitionable");
    //
    //var SnapTransition = require("famous/transitions/SnapTransition");
    //Transitionable.registerMethod('snap', SnapTransition);
    //
    //var mainContext = Engine.createContext();
    //
    //var surface = new Surface({
    //    size: [200, 200],
    //    content: 'drag',
    //    properties: {
    //        backgroundColor: 'rgba(200, 200, 200, 0.5)',
    //        lineHeight: '200px',
    //        textAlign: 'center',
    //        cursor: 'pointer'
    //    }
    //});
    //
    //var draggable = new Draggable({
    //    xRange: [-220, 220],
    //    yRange: [-220, 220]
    //});
    //
    //surface.pipe(draggable);
    //
    //var mod = new StateModifier();
    //
    //var trans = {
    //    method: 'snap',
    //    period: 300,
    //    dampingRatio: 0.3,
    //    velocity: 0
    //};
    //
    //surface.on('mouseup', function() {
    //    draggable.setPosition([0,0,0], trans);
    //});
    //
    //mainContext.add(mod).add(draggable).add(surface);


    //////How to get Famo.us draggable modifier's render node
    ////http://stackoverflow.com/questions/28866020/how-to-get-famo-us-draggable-modifiers-render-node
    //var Engine = require('famous/core/Engine');
    //var Surface = require('famous/core/Surface');
    //var Transform = require('famous/core/Transform');
    //var Modifier = require('famous/core/Modifier');
    //var StateModifier = require('famous/modifiers/StateModifier');
    //var Draggable = require('famous/modifiers/Draggable');
    //var TransitionableTransform = require('famous/transitions/TransitionableTransform');
    //var View = require('famous/core/View');
    //var RenderNode = require('famous/core/RenderNode');
    //var RenderController = require('famous/views/RenderController');
    //
    ///*
    // * @name DragTest
    // * @constructor
    // * @description
    // */
    //
    //function DragTest() {
    //    View.apply(this, arguments);
    //    _createDragSurface.call(this);
    //}
    //
    //DragTest.prototype = Object.create(View.prototype);
    //DragTest.prototype.constructor = DragTest;
    //
    //DragTest.DEFAULT_OPTIONS = {};
    //
    //function _endingDrag(e) {
    //    console.log('end position', e.position, this);
    //    if (e.position[0] < -180) {
    //        this.renderController.hide(this.nodePlayer, function() {
    //            this.surface.emit('removed', {
    //                removedNode: this.nodePlayer
    //            });
    //        }.bind(this));
    //    } else {
    //        this.draggable.setPosition([0, 0, 0], {
    //            duration: 300
    //        });
    //    }
    //}
    //
    //function _updatingDrag(e) {
    //    console.log('update position', e.position);
    //    this.surface.setContent('Position ' + e.position);
    //}
    //
    //
    //function _createDragSurface() {
    //    var yOffset = 0;
    //    for (var i = 0; i < 2; i++) {
    //
    //
    //        var dragSurface = new Surface({
    //            content: 'this is a drag surface',
    //            size: [150, 150],
    //            properties: {
    //                marginLeft: '10px',
    //                backgroundColor: 'grey'
    //            }
    //
    //        });
    //        var dragSurfaceModifier = new StateModifier({
    //            origin: [0, 0],
    //            align: [0.5, yOffset]
    //        });
    //        yOffset += 0.3;
    //
    //        var draggable = new Draggable({
    //            xRange: [-220, 0],
    //            yRange: [0, 0]
    //        });
    //
    //        var renderController = new RenderController();
    //        this.add(renderController);
    //
    //        var nodePlayer = new RenderNode();
    //        nodePlayer.add(dragSurfaceModifier).add(draggable).add(dragSurface);
    //        renderController.show(nodePlayer)
    //
    //        draggable.on('end', _endingDrag.bind({
    //            draggable: draggable,
    //            renderController: renderController,
    //            nodePlayer: nodePlayer,
    //            surface: dragSurface
    //        }));
    //        draggable.on('update', _updatingDrag.bind({
    //            surface: dragSurface
    //        }));
    //
    //        draggable.subscribe(dragSurface);
    //        dragSurface.pipe(this._eventOutput); // so we can emit a custom removed event to this widget
    //
    //    }
    //
    //}
    //
    //var mainContext = Engine.createContext();
    //
    //var dragTest = new DragTest();
    //mainContext.add(dragTest);
    //
    //dragTest.on('removed', function(e) {
    //    console.log('removed ', e.removedNode);
    //});


    /////////////////////implement google paper button effects
    ///////////http://stackoverflow.com/questions/24946191/how-to-implement-google-paper-button-effects
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
    //    var width = (typeof this.size[0] === 'number') ? this.size[0] : this._currentTarget.clientWidth;
    //    var height = (typeof this.size[1] === 'number') ? this.size[1] : this._currentTarget.clientHeight;
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
    //
    //var Engine = require('famous/core/Engine');
    //var StateModifier = require('famous/modifiers/StateModifier');
    //var Transform = require('famous/core/Transform');
    //
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

    //////Scrollview paginated////
    ////http://stackoverflow.com/questions/23649958/how-to-swipe-between-surfaces-in-famo-us
    //var Engine           = require("famous/core/Engine");
    //var Surface          = require("famous/core/Surface");
    //var Scrollview       = require("famous/views/Scrollview");
    //
    //var mainContext = Engine.createContext();
    //
    //var scrollview = new Scrollview({
    //    direction: 0,
    //    paginated: true
    //});
    //var surfaces = [];
    //
    //scrollview.sequenceFrom(surfaces);
    //
    //for (var i = 0; i < 10; i++) {
    //    surface = new Surface({
    //        content: "Surface: " + (i + 1),
    //        size: [window.innerWidth, window.innerHeight],
    //        properties: {
    //            backgroundColor: "hsl(" + (i * 360 / 10) + ", 100%, 50%)",
    //            lineHeight: window.innerHeight/10 + "px",
    //            textAlign: "center"
    //        }
    //    });
    //
    //    surface.pipe(scrollview);
    //
    //    surfaces.push(surface);
    //}
    //
    //mainContext.add(scrollview);


    ////add walls to a famo.us physics simulation
    //http://stackoverflow.com/questions/23399011/how-to-add-walls-to-a-famo-us-physics-simulation
    var Engine          = require('famous/core/Engine');
    var Surface         = require('famous/core/Surface');
    var EventHandler    = require('famous/core/EventHandler');
    var View            = require('famous/core/View');
    var Transform       = require('famous/core/Transform');

    var StateModifier   = require('famous/modifiers/StateModifier');

    var PhysicsEngine   = require('famous/physics/PhysicsEngine');
    var Body            = require('famous/physics/bodies/Body');
    var Circle          = require('famous/physics/bodies/Circle');
    var Wall            = require('famous/physics/constraints/Wall');

    var context = Engine.createContext();

    var handler = new EventHandler();

    var physicsEngine = new PhysicsEngine();

    var ball = new Surface ({
        size: [200,200],
        properties: {
            backgroundColor: 'red',
            borderRadius: '100px'
        }
    })

    ball.state = new StateModifier({origin:[0.5,0.5], align: [0.5, 0.5]});

    ball.particle = new Circle({radius:100});

    physicsEngine.addBody(ball.particle);

    ball.on("click",function(){
        ball.particle.setVelocity([1,1,0]);
    });

    context.add(ball.state).add(ball)

    var leftWall    = new Wall({normal : [1,0,0],  distance : window.innerWidth/2.0, restitution : 0.5});
    var rightWall   = new Wall({normal : [-1,0,0], distance : window.innerWidth/2.0, restitution : 0.5});
    var topWall     = new Wall({normal : [0,1,0],  distance : window.innerHeight/2.0, restitution : 0.5});
    var bottomWall  = new Wall({normal : [0,-1,0], distance : window.innerHeight/2.0, restitution : 0.5});

    physicsEngine.attach( leftWall,  [ball.particle]);
    physicsEngine.attach( rightWall, [ball.particle]);
    physicsEngine.attach( topWall,   [ball.particle]);
    physicsEngine.attach( bottomWall,[ball.particle]);

    Engine.on('prerender', function(){
        ball.state.setTransform(ball.particle.getTransform())
    });
});
