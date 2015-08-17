define(function(require, exports, module) {
	'use strict';
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

	function PageView() {
		this.actors = {}; // Collection of actors by name.
	}
});
