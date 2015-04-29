define(function(require, exports, module) {
    'use strict';
    var MetNodeFactory       = require('tools/MetNodeFactory');
    var ActionFactory      = require('tools/ActionFactory');
    var UnitConverter      = require('tools/UnitConverter');

    function Director() {
        this.metnodes = {}; // Collection of nodes by name.
    }

    Director.prototype.populateStage = function(stage, nodeDescriptions, actionDescriptions) {
        var nodeFactory = new MetNodeFactory();
        var actionFactory = new ActionFactory();
        var keyboardBreakPoints = [];

        for (var nodeName in nodeDescriptions) {
            // Make sure the zIndex is included in the properties
            if (nodeDescriptions[nodeName].zPosition && nodeDescriptions[nodeName].properties) {
                nodeDescriptions[nodeName].properties.zPosition = nodeDescriptions[nodeName].zPosition;
            }

            // Make sure size is in pixels.
            nodeDescriptions[nodeName].size = _unitsToPixels(nodeDescriptions[nodeName].size);

            // Make sure position is in pixels.
            if (nodeDescriptions[nodeName].position) {
                nodeDescriptions[nodeName].position = _unitsToPixels(nodeDescriptions[nodeName].position);
            }

            var newNode = nodeFactory.makeMetNode(nodeName,
                                                  nodeDescriptions[nodeName].type,
                                                  nodeDescriptions[nodeName].content,
                                                  nodeDescriptions[nodeName].classes,
                                                  nodeDescriptions[nodeName].properties,
                                                  nodeDescriptions[nodeName].size,
                                                  nodeDescriptions[nodeName].opacity
                                                  );
            this.metnodes[nodeName] = newNode;
            newNode.setPositionPixels(nodeDescriptions[nodeName].position[0], nodeDescriptions[nodeName].position[1]);
        }

        // Reorder the action descriptions by type, since order matters for
        // some types of actions / modifiers.
        actionDescriptions = actionDescriptions.sort(actionFactory.actionComparator);

        for (var i = 0; i < actionDescriptions.length; i++) {
            var actionDesc = actionDescriptions[i];
            var node = this.metnodes[actionDesc.actor];

            // Here we skip the useless action that associated with a undefined node
            if(!node) {
                continue;
            }
            // Keep track of break points
            if (actionDesc.setBreak) {
                keyboardBreakPoints.push(actionDesc.stop);
            }

            // If action takes a location, ensure that it's in pixels
            if (actionDesc.properties && actionDesc.properties.location) {
                actionDesc.properties.location = _unitsToPixels(actionDesc.properties.location);
            }

            actionFactory.makeAction(node,
                                     actionDesc.type,
                                     actionDesc.start,
                                     actionDesc.stop,
                                     actionDesc.properties
                                    );
        }

        for (var actorToStage in this.metnodes) {
            var currActor = this.metnodes[actorToStage];
            stage.addNode(currActor);
        }

        stage.updateArrowKeyBreakpoints(keyboardBreakPoints);
    };

    function _unitsToPixels(initial) {
        var result =[];
        for (var i = 0; i <= 1; i++) {
            var checkVal = '' + initial[i]; // cast to string
            // Check if units are percentages and adjust is necessary
            // otherwise units are assumed to be pixels.
            if (checkVal.charAt(checkVal.length - 1) === '%') {
                if (i === 0) {
                    result[i] = UnitConverter.percentageToPixelsX(parseFloat(checkVal.slice(0, checkVal.length - 1)));
                }
                if (i === 1) {
                    result[i] = UnitConverter.percentageToPixelsY(parseFloat(checkVal.slice(0, checkVal.length - 1)));
                }
            } else {
                result[i] = initial[i];
            }
        }
        return result;
    }

    module.exports = Director;
});
