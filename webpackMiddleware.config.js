'use strict'

// Local Dependencies
import webpackConfig from './webpack.config';


// Configs for Webpack middleware
// Further reading: https://github.com/glenjamin/webpack-hot-middleware 
module.exports = {
  DEV: {
    noInfo: true,
    historyApiFallback: true,
    publicPath: webpackConfig.output.publicPath,
    stats: { 
      colors: true 
    },
    watchOptions: { 
      aggregateTimeout: 1000, poll: 1000 
    }
  },
  HOT: {
    log: console.log
  }
};
