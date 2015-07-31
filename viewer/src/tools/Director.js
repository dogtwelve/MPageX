define(function(require, exports, module) {
    'use strict';
    var MetNodeFactory       = require('tools/MetNodeFactory');
    var ActionFactory      = require('tools/ActionFactory');
    var UnitConverter      = require('tools/UnitConverter');
    var StageView          = require('views/StageView');
    var MetNodeView          = require('views/MetNodeView');
    var DebugUtils          = require('utils/DebugUtils');

    function Director() {
        this.metnodes = {}; // Collection of nodes by name.
    }

    Director.prototype.populateStage = function(stage, nodeDescriptions) {
        var nodeFactory = MetNodeFactoryInstance;
        var stageMetnodes = {};
        this.metnodes[stage.pageId] = stageMetnodes;
        //var stageMetnodes = this.metnodes[stage.pageId];
        var zPos = 0;
        for (var nodeName in nodeDescriptions) {
            var newNode = nodeFactory.makeMetNode(nodeDescriptions[nodeName], stage.containerSize, zPos);
            stageMetnodes[nodeName] = newNode.metNode;
            zPos = newNode.zPos;
        }

        stage._eventInput.on('metview-click',function(data){
            if(this instanceof MetNodeView) {
                //DebugUtils.log(this.metNodeId + " on metview-click event from " + data.metNodeId);
            } else if(this instanceof StageView) {
                //DebugUtils.log("StageView on metview-click event from " + data.metNodeId);
            } else {
                //DebugUtils.log("other on metview-click event from " + data.metNodeId);
            }

        }.bind(stage));

        for (var nodeToStage in stageMetnodes) {
            var curNode = stageMetnodes[nodeToStage];
            //if(curNode.type === "MetScrollNode")
            //{
            //    console.log("no subscribe MetScrollNode");
            //} else {
            //    stage._eventOutput.subscribe(curNode);
            //}
            stage.addMetNode(curNode);
        }

    };

    //Director.prototype.populateStageNew = function(stage, nodeDescriptions, actionDescriptions) {
    //    var nodeFactory = new MetNodeFactory();
    //    var actionFactory = new ActionFactory();
    //    var keyboardBreakPoints = [];
    //
    //    for (var nodeName in nodeDescriptions) {
    //        //// Make sure the zIndex is included in the properties
    //        //if (nodeDescriptions[nodeName].zPosition && nodeDescriptions[nodeName].properties) {
    //        //    nodeDescriptions[nodeName].properties.zPosition = nodeDescriptions[nodeName].zPosition;
    //        //}
    //        //
    //        //// Make sure size is in pixels.
    //        //nodeDescriptions[nodeName].size = _unitsToPixels(nodeDescriptions[nodeName].size);
    //        //
    //        //// Make sure position is in pixels.
    //        //if (nodeDescriptions[nodeName].position) {
    //        //    nodeDescriptions[nodeName].position = _unitsToPixels(nodeDescriptions[nodeName].position);
    //        //}
    //
    //        //var newNode = nodeFactory.makeMetNode(nodeName,
    //        //                                      nodeDescriptions[nodeName].type,
    //        //                                      nodeDescriptions[nodeName].content,
    //        //                                      nodeDescriptions[nodeName].classes,
    //        //                                      nodeDescriptions[nodeName].properties,
    //        //                                      nodeDescriptions[nodeName].size,
    //        //                                      nodeDescriptions[nodeName].opacity
    //        //                                      );
    //
    //        var newNode = nodeFactory.makeMetNodeNew(nodeName, nodeDescriptions[nodeName], stage.options.containerSize);
    //        this.metnodes[nodeName] = newNode;
    //        //newNode.setPositionPixels(nodeDescriptions[nodeName].position[0], nodeDescriptions[nodeName].position[1]);
    //    }
    //    //this.metnodes = nodeFactory.metNodesFromFactory;
    //    // Reorder the action descriptions by type, since order matters for
    //    // some types of actions / modifiers.
    //    actionDescriptions = actionDescriptions.sort(actionFactory.actionComparator);
    //
    //    for (var i = 0; i < actionDescriptions.length; i++) {
    //        var actionDesc = actionDescriptions[i];
    //        var node = this.metnodes[actionDesc.actor];
    //
    //        // Here we skip the useless action that associated with a undefined node
    //        if(!node) {
    //            continue;
    //        }
    //        // Keep track of break points
    //        if (actionDesc.setBreak) {
    //            keyboardBreakPoints.push(actionDesc.stop);
    //        }
    //
    //        //// If action takes a location, ensure that it's in pixels
    //        //if (actionDesc.properties && actionDesc.properties.location) {
    //        //    actionDesc.properties.location = UnitConverter._unitsToPixels(actionDesc.properties.location);
    //        //}
    //
    //        //actionFactory.makeAction(node,
    //        //                         actionDesc.type,
    //        //                         actionDesc.start,
    //        //                         actionDesc.stop,
    //        //                         actionDesc.properties
    //        //                        );
    //        actionFactory.makeActionNew(node, actionDesc);
    //    }
    //
    //    for (var actorToStage in this.metnodes) {
    //        var currActor = this.metnodes[actorToStage];
    //        stage.addMetNode(currActor);
    //    }
    //
    //    stage.updateArrowKeyBreakpoints(keyboardBreakPoints);
    //};

    //function _unitsToPixels(initial) {
    //    var result =[];
    //    for (var i = 0; i <= 1; i++) {
    //        var checkVal = '' + initial[i]; // cast to string
    //        // Check if units are percentages and adjust is necessary
    //        // otherwise units are assumed to be pixels.
    //        if (checkVal.charAt(checkVal.length - 1) === '%') {
    //            if (i === 0) {
    //                result[i] = UnitConverter.percentageToPixelsX(parseFloat(checkVal.slice(0, checkVal.length - 1)));
    //            }
    //            if (i === 1) {
    //                result[i] = UnitConverter.percentageToPixelsY(parseFloat(checkVal.slice(0, checkVal.length - 1)));
    //            }
    //        } else {
    //            result[i] = initial[i];
    //        }
    //    }
    //    return result;
    //}

    module.exports = Director;
});
