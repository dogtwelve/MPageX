define(function(require, exports, module) {
    var Engine = require('famous/core/Engine');
    var Modifier = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var Surface = require('famous/core/Surface');

    var GenericSync = require('famous/inputs/GenericSync');
    var MouseSync = require('famous/inputs/MouseSync');
    var TouchSync = require('famous/inputs/TouchSync');
    var Transitionable = require('famous/transitions/Transitionable');

    var options = {
        openPosition: -276,
        transition: {
            duration: 300,
            curve: 'easeOut'
        },
        posThreshold: 138,
        velThreshold: 0.50
    };

    var mainContext = Engine.createContext();

    GenericSync.register({
        'mouse': MouseSync,
        'touch': TouchSync
    });

    var currentPos = new Transitionable([0, 0]);

    var surf = new Surface({
        size: [300, 300],
        properties: {
            backgroundColor: '#FA5C4F',
            color: 'white',
            textAlign: 'center',
            fontSize: '36px',
            cursor: 'pointer'
        },
        content: '<< surf to the left'
    });

    var stMod = new StateModifier({
        origin: [0.5, 0.5]
    });

    var mod = new Modifier({
        transform: function () {
            var pos = currentPos.get();
            return Transform.translate(pos[0], pos[1], 0);
        }
    });

    var sync = new GenericSync(['mouse', 'touch']);
    surf.pipe(sync);

    // while i am dragging
    sync.on('update', function (data) {
        var pos = currentPos.get();
        currentPos.set([pos[0] + data.delta[0], pos[1]]);
    });

    // how/where the swipe has to end after the mouseup
    sync.on('end', function (data) {
        var velocity = data.velocity[0];
        var pos = currentPos.get();

        if (pos[0] > options.posThreshold) {
            if (velocity < -options.velThreshold) {
                // slide Left
                currentPos.set([options.openPosition, 0], options.transition);
            } else {
                // slide Right
                currentPos.set([0, 0], options.transition);
            }
        } else {
            if (velocity > options.velThreshold) {
                // slide Right
                currentPos.set([0, 0], options.transition);
            } else {
                // slide Left
                currentPos.set([options.openPosition, 0], options.transition);
            }
        }
    });

    mainContext.add(stMod).add(mod).add(surf);
});
