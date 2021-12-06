// /////////////////////////////////////
// Node utils
const path = require('path')

// Plugins
const EsLintPlugin = require('eslint-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const FaviconPlugin = require('favicons-webpack-plugin')
const MiniCssPlugin = require('mini-css-extract-plugin')
// /////////////////////////////////////

// !! Instead of exporting an object config we export function that takes two params: env and argv.
// !! The're almost the same:
// // env - { WEBPACK_BUNDLE: true, WEBPACK_BUILD: true }
// // argv - { mode: 'development', env: { WEBPACK_BUNDLE: true, WEBPACK_BUILD: true } }
// !! The thing is this method gives us an oportunity to change the configuration depending on current mode - prod or development

module.exports = (env, { mode }) => {
  const isProd = mode === 'production'
  const isDev = !isProd

  const getDefaultFilename = ext =>
    isProd ? `[name].[contenthash].bundle.${ext}` : `[name].bundle.${ext}`
  const getPlugins = () => {
    const base = [
      new EsLintPlugin(),
      // installed plugins to tell webpack to do an additional work while compilating
      // each plugin has configuration, read the docs
      new HtmlPlugin({
        title: 'Tablesheets application', // head-title of html document in dist folder
        template: './index.html',
      }),
      new FaviconPlugin({
        logo: './favicon.png',
        prefix: 'favicons/',
        // mode: 'webapp',
        // devMode: 'webapp'
      }), // in a simple way - path to logo as a first param in a func, or an object
      new MiniCssPlugin({
        // a plugin for a step in an css-files compilation, which transform all css code in minifien ver. in another file
        filename: getDefaultFilename('css'),
      }),
      // new CopierPlugin({
      //   patterns: [
      //     {
      //       // for favicons we can use favicons-webpack-plugin instead of copy-wbk-plugin
      //       // that generates a full set of icons for different devices based on one file that we select in config
      //       from: path.resolve(__dirname, 'src', 'favicon.ico'),
      //       to: path.resolve(__dirname, 'dist'),
      //     },
      //   ],
      //   options: {},
      // }),
    ]
    if (isProd) {
      return base.filter(plugin => !plugin instanceof EsLintPlugin)
    }

    return base
  }

  return {
    devtool: isDev && 'source-map',
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      client: {
        overlay: {
          errors: true,
          warnings: true,
        },
      },
      // compress: true,
      port: '5000',
      open: true,
      hot: true,
      watchFiles: './',
    },
    context: path.resolve(__dirname, 'src'), // absolute path to a directory wit all entry files
    entry: {
      main: ['core-js/stable', 'regenerator-runtime/runtime', './index.js'], // each key in that object means a different chunk. paths are realtive to 'context' prop
    },
    output: {
      path: path.resolve(__dirname, 'dist'), // an absolute path to the output directory
      filename: getDefaultFilename('js'), // dynamic name for each chunk from the entry directory
      clean: true, // this prop when set to true is cleaning duplicates in dist folder
    },
    resolve: {
      extensions: ['.js'], // this thing help us to write while importing './index' instead of './index.js'
      alias: {
        // to import in an easier way:
        // instead of '../../utils/file' we can write 'utils/file' no matter in where the file we are in is located
        '@': path.resolve(__dirname, 'src'),
        '@core': path.resolve(__dirname, 'src', 'core'),
      },
    },
    plugins: getPlugins(),

    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Bundle CSS into one css file
            MiniCssPlugin.loader,
            // Translates CSS into CommonJS
            'css-loader',
            // Compiles Sass to CSS
            'sass-loader',
          ],
        },
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
      ],
    },
  }
}
