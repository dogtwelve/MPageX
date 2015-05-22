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

    var Engine = require('famous/core/Engine');
    var Surface = require('famous/core/Surface');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var Timer = require('famous/Utilities/Timer');

    var convert = Math.PI/180;
    var matrix=[];
    var x, y, rot, scale;
    var rotate = [
        [0, 0, 0],
        [0, 90, 0],
        [0, -90, 0],
        [0, 0, 0],
        [90, 0, 0],
        [-90, 0, 0]
    ];
    var size = 100;
    var xlate = [
        [0, 0, size],
        [size, 0, 0],
        [-size, 0, 0],
        [0, 0, -size],
        [0, size, 0],
        [0, -size, 0]
    ];
    var xlt, rot;

    function originalCube() {
        for (var i =0; i <6; i++) {
            xlt = xlate[i]
            rot = rotate[i];
            matrix.push(Transform.multiply(
                Transform.translate(xlt[0], xlt[1], xlt[2]),
                Transform.rotate(rot[0]*convert, rot[1]*convert, rot[2]*convert)))

            _smod[i].setTransform(
                matrix[i], {
                    duration:0
                });
        }
    }
    var rotationY =0;
    var rotationZ = 0;
    var matrix2;
    function rotateCube() {
        for (var i = 0; i < colors.length; i++) {
            xlt = xlate[i];
            rot = rotate[i];
            matrix2 =Transform.rotate(0, rotationY*convert,rotationZ*convert);

            matrix2 =
                Transform.multiply(
                    matrix2,
                    matrix[i]
                )
            callback = function(){
                rotationY+=0.1;
                rotationZ+=0.2;
            }
            _smod[i].setTransform(
                matrix2, {
                    duration: 0
                },callback);
        }
    }

    //    var StateModifier = require('famous/modifiers/StateModifier');

    var _ctx = Engine.createContext();
    _ctx.setPerspective(5000);
    var colors = ['red', 'blue', 'violet', 'green', 'yellow', 'aqua'];
    var _surface = [];
    var _smod = [];
    for (var i = 0; i < colors.length; i++) {
        _surface[i] = new Surface({
            size: [size*2, size*2],
            properties: {
                backgroundColor: colors[i],
                opacity: 0.9
            }
        });
        _surface[i].addClass("backfaceVisibility");
        _smod[i] = new Modifier({
            origin: [0.5, 0.5]
        });
        _ctx.add(_smod[i]).add(_surface[i]);
    }
    originalCube()
    Timer.setInterval(rotateCube, 20)
});
