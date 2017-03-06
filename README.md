## Istanbul plugin for [webpack](https://webpack.github.io/)

[![npm](http://img.shields.io/npm/v/webpack-istanbul-plugin.svg?style=flat-square)](https://www.npmjs.org/package/webpack-istanbul-plugin)
[![deps](http://img.shields.io/david/DxCx/webpack-istanbul-plugin.svg?style=flat-square)](https://david-dm.org/DxCx/webpack-istanbul-plugin#info=dependencies)

Instrument JS files with [Istanbul](https://github.com/gotwarlost/istanbul) for subsequent code coverage reporting.

This is a full plugin which will also act as a instrument loader,
and also make sure that all files will be included in the report.

### Install

```sh
$ npm i -D webpack-istanbul-plugin
```

### Setup

#### References

* [Using loaders](https://webpack.github.io/docs/using-loaders.html)
* [karma-webpack](https://github.com/webpack/karma-webpack#karma-webpack)
* [karma-coverage](https://github.com/karma-runner/karma-coverage#configuration)
* [istanbul-instrumenter-loader](https://github.com/deepsweet/istanbul-instrumenter-loader)

#### Project structure

Let's say you have the following:

```
├── src/
│   └── components/
│       ├── bar/
│       │   └── index.js
│       └── foo/
│           └── index.js
└── test/
    └── src/
        └── components/
            └── foo/
                └── index.js
```

To create a code coverage report for all components (even for those for which you have no tests yet) you have to process all files.
then, run the tests.

this is very similar to ["Project structure"](https://github.com/deepsweet/istanbul-instrumenter-loader#project-structure), but we don't actually require everything, just load it and then require just the tests.

#### test/index.js

```js
const codeContext = require.context("./src/components", true, /.+\.js$/);
codeContext.keys().forEach((file) => {
    // And require all spec files to run them.
    if ( file.indexOf(".spec.js") !== -1 ) {
        codeContext(file);
    }
});
```

This file will be the only entry point for Webpack:

#### webpack.config.test.js

```js
    …
    module.exports = {
        …
        module: {
            preLoaders: [
                // instrument only testing sources with Istanbul
                {
                    test: /\.js$/,
                    include: path.resolve('src/components/'),
                    loader: 'istanbul-instrumenter'
                }
            ],
			plugins: [
				new IstanbulPlugin({
					test: /\.js$/,
					include: [
						path.resolve('src/components'),
					],
					exclude: [
						path.resolve('node_modules'),
						path.resolve('test/index.js'),
						/\.spec\.js$/,
					],
				}),
			],
        }
        …
    },
```

#### Example Usage

I'm using this with both [mocha-webpack](https://www.npmjs.com/package/mocha-webpack) and [mocha-istanbul-spec](https://www.npmjs.com/package/mocha-istanbul-spec)
here is an [example repository](https://github.com/DxCx/webpack-graphql-server/tree/df4f79b8c4ab816b57858156423e59b5da108037)

### License
[WTFPL](http://www.wtfpl.net/wp-content/uploads/2012/12/wtfpl-strip.jpg)
