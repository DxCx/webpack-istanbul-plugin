'use strict';

var istanbul = require('istanbul');
var loaderUtils = require('loader-utils');
var assign = require('object-assign');

var defaultOptions = {
    embedSource: true,
    noAutoWrap: true
};

module.exports = function(source) {
	var userOptions = loaderUtils.parseQuery(this.query);
	var instrumenter = new istanbul.Instrumenter(
			assign({}, defaultOptions, userOptions)
			);
	var ret = instrumenter.instrumentSync(source, this.resourcePath);

	this._module.meta.coverState = instrumenter.coverState;
	return ret;
};
