'use strict'

 // Import components
let autoprefixer = require('autoprefixer');
let webpack = require('webpack');
let path = require('path');

// Export only the config to be consumed by the
module.exports = {
  // Entry points into the build process
  entry: [
    'webpack/hot/dev-server',
    'webpack-hot-middleware/client',
    path.join(__dirname, '/app/index.js')
  ],
  
  // Output build path
  output: {
    path: '/',
    publicPath: 'http://localhost:3000/dist',
    filename: 'bundle.js'
  },

  // Set up source mapping for debugging
  devtool: "source-map",

  // Webpack Loaders (transformations)
  // http://webpack.github.io/docs/using-loaders.html
  module: {
    loaders: [
      // Font files
      {
        test: /\.(ttf|eot|woff)(\?.*)?$/,
        loaders: ['url']
      },
      // Clean up SVGs
      {
        test: /\.svg(\?.*)?$/,
        loaders: ['url', 'svgo']
      },
      // Stylesheets
      {
        test: /\.css$/,
        loaders: ['style', 'css']
      },
      // ES6
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loaders: ['react-hot', 'babel']
      },
      // ESlinter for code sanity
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['eslint']
      },
      // Markup
      {
        test: /\.html$/,
        loader: 'html'
      },
      // Standard JSON
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },

  // ESLint specification
  eslint: {
    parser: 'babel-eslint'
  },

  // Handle all vendor prefixes
  postcss: function() {
    return [autoprefixer];
  },

  // http://webpack.github.io/docs/using-plugins.html  
  plugins: [
    // https://github.com/glenjamin/webpack-hot-middleware 
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]
};




// "dev": "nodemon --exec babel-node server/server.js --presets es2015,stage-2",