var istanbul = require('istanbul');
var path = require('path');

function IstanbulPlugin(options) {
	options = Object.assign({}, options);
	options = {
		test: options && options.test ? options.test : /$/,
		include: options && options.include ? options.include : [],
		exclude: options && options.exclude ? options.exclude : [],
	}
	if ( false === Array.isArray(options.include) ) {
		options.include = [options.include];
	}
	if ( false === Array.isArray(options.exclude) ) {
		options.exclude = [options.exclude];
	}
	this._options = options;
	this.instrumented = {};
}

IstanbulPlugin.prototype.filterModule = function(module) {
	if ( module.error ) {
		return true;
	}

	if ( !module.userRequest ) {
		return true;
	}
	if ( false === this._options.test.test(module.userRequest) ) {
		return true;
	}
	if ( true === this._options.exclude.reduce(function(prevVal, pattern) {
		if ( true === prevVal ) {
			return true;
		}
		if ( typeof pattern === "string" ) {
			return module.userRequest.indexOf(pattern) >= 0;
		}

		return pattern.test(module.userRequest);
	}, false) ) {
		return true;
	}

	if ( false === this._options.include.reduce(function(prevVal, pattern) {
		if ( true === prevVal ) {
			return true;
		}
		if ( typeof pattern === "string" ) {
			return module.userRequest.indexOf(pattern) >= 0;
		}

		return pattern.test(module.userRequest);
	}, false) ) {
		return true;
	}

	return false;
}

IstanbulPlugin.prototype.apply = function(compiler) {
	compiler.plugin("compilation", function(compilation, callback) {
		// Register Instrumenter for modules
		compilation.plugin("normal-module-loader", function(loaderContext, module) {
			if ( this.filterModule(module) ) {
				return;
			}

			module.loaders.unshift(path.resolve(__dirname + "/instrument-loader.js"));
		}.bind(this));

		// Read metadata set by Instrumenter
		compilation.plugin("succeed-module", function(module) {
			if ( this.filterModule(module) ) {
				return;
			}

			this.processModule(module);
		}.bind(this));

		// Inject instrumented files.
		compilation.mainTemplate.plugin('startup', function(source, module, hash) {
			if ( 0 === this.instrumented.length ) {
				return source;
			}

			return `global.__coverage__ = ${JSON.stringify(this.instrumented)};\n`+source;
		}.bind(this));
	}.bind(this));
};

IstanbulPlugin.prototype.processModule = function(module) {
	this.instrumented[module.userRequest] = module.meta.coverState;
}

module.exports = IstanbulPlugin;
