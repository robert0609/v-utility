var baseConfig = require('./webpack.base.config');
var merge = require('webpack-merge');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
var path = require('path');

module.exports = merge(baseConfig, {
	devtool: 'cheap-source-map',
	output: {
		path: path.resolve(__dirname, '../dist'),
		filename: 'vUtility.min.js',
		publicPath: '/dist/',
		library: 'vUtility',
		libraryTarget: 'umd'
	},
	externals: {
		'babel-polyfill': {
			commonjs: 'babel-polyfill',
			commonjs2: 'babel-polyfill',
			amd: 'babel-polyfill'
		},
    'v-math': {
      root: 'vMath',
      commonjs: 'v-math',
      commonjs2: 'v-math',
      amd: 'v-math'
    }
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			},
			sourceMap: false
		}),
		new ExtractTextPlugin('[name].css'),
		new OptimizeCSSPlugin({
			cssProcessorOptions: {
				safe: true
			}
		})
	]
});
