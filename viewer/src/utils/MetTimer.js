define(function(require, exports, module) {
	var FamousEngine = require('famous/core/Engine');

	var _event  = 'prerender';

	var getTime = (window.performance && window.performance.now) ?
		function() {
			return window.performance.now();
		}
		: function() {
		return Date.now();
	};

	/**
	 * Add a function to be run on every prerender
	 *
	 * @method addTimerFunction
	 *
	 * @param {function} fn function to be run every prerender
	 *
	 * @return {function} function passed in as parameter
	 */
	function addTimerFunction(fn) {
		FamousEngine.on(_event, fn);
		return fn;
	}

	/**
	 * Wraps a function to be invoked after a certain amount of time.
	 *  After a set duration has passed, it executes the function and
	 *  resets the execution time.
	 *
	 * @method setInterval
	 *
	 * @param {function} fn function to be run after a specified duration
	 * @param {number} duration interval to execute function in milliseconds
	 *
	 * @return {function} function passed in as parameter
	 */
	function setInterval(fn, duration) {
		var t = getTime();
		var callback = function() {
			var t2 = getTime();
			var elapse = t2 - t;
			if (elapse >= duration) {
				fn.call(this, Math.floor(elapse));
				t = getTime();
			}
		};
		return addTimerFunction(callback);
	}

	/**
	 * Remove a function that gets called every prerender
	 *
	 * @method clear
	 *
	 * @param {function} fn event linstener
	 */
	function clear(fn) {
		FamousEngine.removeListener(_event, fn);
	}

	module.exports = {
		setInterval: setInterval,
		clear : clear
	};
});