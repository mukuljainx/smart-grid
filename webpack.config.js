const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  node: {
    fs: 'empty',
  },
  entry: ['./src'],
  plugins: [new HtmlWebpackPlugin({ template: './src/index.html' })],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['ts-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
      { test: /\.html$/, use: 'html-loader' },
      {
        test: /\.mdx?$/,
        use: ['babel-loader', '@mdx-js/loader'],
      },
    ],
  },
  target: 'web',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: 'inline-source-map',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'docs'),
  },
  optimization: {
    splitChunks: {
      name: true,
      cacheGroups: {
        commons: {
          chunks: 'initial',
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          priority: -10,
        },
      },
    },
    runtimeChunk: true,
  },
  devServer: {
    contentBase: path.join(__dirname, 'src'),
    compress: false,
    stats: 'minimal',
    historyApiFallback: true,
    port: 9000,
    hot: true,
  },
  mode: 'development',
};
