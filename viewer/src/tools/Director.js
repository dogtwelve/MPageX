define(function(require, exports, module) {
    'use strict';
	var Surface = require('famous/core/Surface');
	var StageView          = require('views/StageView');
	var MetNodeView          = require('views/MetNodeView');
	var OverlayView = require('views/OverlayView');
	var DebugUtils          = require('utils/DebugUtils');
    var MetNodeFactory = require('tools/MetNodeFactory');
    var ActionFactory      = require('tools/ActionFactory');
    var UnitConverter      = require('tools/UnitConverter');


    function Director() {
        this.metnodes = {}; // Collection of nodes by name.
    }

    Director.prototype.populateStage = function(stage, nodeDescriptions) {
        var nodeFactory = MetNodeFactory.sharedInstance();
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
			if(curNode.nodeDesc.nodeSubordinate === "met_node_subordinate_screen_02468") {
				var overlay = OverlayView.OverlayViewFactory.getInstance();
				overlay.addMetNode(curNode);
			} else {
				stage.addMetNode(curNode);
			}
        }

    };

    module.exports = Director;
});
