'use strict'

const { merge } = require('webpack-merge')

const common = require('./webpack.common.js')
const PATHS = require('./paths')
const path = require('path')

// Merge webpack configuration files
const config = (env, argv) =>
    merge(common, {
        entry: {
            popup: PATHS.src + '/popup.ts',
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
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-react',
                            ],
                        },
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
            alias: {
                // Dirty fix, why? https://chatgpt.com/share/0396f280-d37c-4908-92cf-36984607ed1d
                '@milkdown/react': path.resolve(
                    __dirname,
                    '../node_modules/@milkdown/react/lib/index.es.js'
                ),
                '@milkdown/theme-nord': path.resolve(
                    __dirname,
                    '../node_modules/@milkdown/theme-nord/lib/index.es.js'
                ),
                '@milkdown/kit/core': path.resolve(
                    __dirname,
                    '../node_modules/@milkdown/kit/lib/core.js'
                ),
                '@milkdown/kit/preset/commonmark': path.resolve(
                    __dirname,
                    '../node_modules/@milkdown/kit/lib/preset/commonmark.js'
                ),
                '@milkdown/kit/plugin/listener': path.resolve(
                    __dirname,
                    '../node_modules/@milkdown/kit/lib/plugin/listener.js'
                ),
            },
        },
        devtool: argv.mode === 'production' ? false : 'source-map',
        output: {
            libraryTarget: 'umd',
        },
        target: 'web',
    })

module.exports = config
