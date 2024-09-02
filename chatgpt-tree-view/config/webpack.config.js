'use strict'

const { merge } = require('webpack-merge')

const common = require('./webpack.common.js')
const PATHS = require('./paths')

// Merge webpack configuration files
const config = (env, argv) =>
    merge(common, {
        entry: {
            popup: PATHS.src + '/popup.js',
            content: PATHS.src + '/content.ts',
            background: PATHS.src + '/background.ts',
        },
        devtool: argv.mode === 'production' ? false : 'source-map',
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                    },
                },
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader',
                    },
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader', 'postcss-loader'],
                },
            ],
        },
        resolve: {
            extensions: ['.js', '.ts', '.tsx'],
        },
        devtool: argv.mode === 'production' ? false : 'source-map',
    })

module.exports = config
