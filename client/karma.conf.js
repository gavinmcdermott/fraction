// Karma configuration
// Generated on Sun Jan 10 2016 22:15:08 GMT-0800 (PST)
var webpack = require('webpack');

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      // '*.js',
      // '**/*.js',
      '**/spec/*.spec.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '*.js': ['webpack'],
      '**/*.js': ['webpack'],
      '**/**/*.js': ['webpack'],
      '**/spec/*.spec.js': ['webpack']
    },

    plugins: [
      'karma-jasmine',
      'karma-webpack',
      'karma-chrome-launcher',
      'karma-babel-preprocessor'
    ],

    // Webpack config object
    webpack: {
      
      node: {
        fs: 'empty'
      },

      module: {
        entry: './index.js',
        loaders: [
          // ES6
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            loaders: ['babel-loader']
          }
        ]
      }
    },
    
    webpackMiddleware: {
      noInfo: true,
    },

    devtool: "#inline-source-map",

    // https://github.com/spaceviewinc/fetch-mock-forwarder
    // https://github.com/wheresrhys/fetch-mock/issues/57

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
