/*eslint-disable no-var */
var webpack = require('webpack')

module.exports = function (config) {

  config.set({

    browsers: [ 'PhantomJS' ],
    frameworks: [ 'mocha' ],
    reporters: [ 'mocha' ],

    files: [
      'node_modules/babel-core/browser-polyfill.min.js',
      'tests.webpack.js',
    ],

    preprocessors: {
      'tests.webpack.js': [ 'webpack', 'sourcemap' ],
    },

    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [
          { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
        ],
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('test'),
        }),
      ],
    },

    webpackMiddleware: {
      noInfo: true,
    },

    singleRun: !!process.env.TRAVIS || !!process.env.RELEASE,

  })

}
