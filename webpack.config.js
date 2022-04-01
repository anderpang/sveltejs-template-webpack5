const path = require('path');
const sveltePreprocess = require('svelte-preprocess');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const InterpolateHtmlPlugin = require("interpolate-html-plugin");

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

const outputPath = path.join(__dirname, "build");
const PUBLIC_URL = "/";

module.exports = function (env, argv) {
	var config = {
		mode,
		entry: {
			'main': ['./src/main.ts']
		},
		output: {
			path: outputPath,
			filename: 'js/[name].[fullhash].js',
			chunkFilename: 'js/[name].[id].js',
			publicPath: PUBLIC_URL,
		},
		resolve: {
			alias: {
				svelte: path.dirname(require.resolve('svelte/package.json')),
				"@": path.join(__dirname, "src"),
			},
			extensions: ['.mjs', '.js', '.ts', '.svelte'],
			mainFields: ['svelte', 'browser', 'module', 'main']
		},

		module: {
			rules: [{
					test: /\.ts$/,
					loader: 'ts-loader',
					exclude: /node_modules/
				},
				{
					test: /\.svelte$/,
					use: {
						loader: 'svelte-loader',
						options: {
							compilerOptions: {
								dev: !prod
							},
							emitCss: prod,
							hotReload: !prod,
							preprocess: sveltePreprocess({
								sourceMap: !prod
							})
						}
					}
				},
				{
					test: /\.css$/,
					use: [
						'style-loader',
						'css-loader'
					]
				},
				{
					test: /\.scss$/,
					use: [{
							loader: 'style-loader'
						},
						{
							loader: 'css-loader',
							options: {
								sourceMap: true
							}
						},
						{
							loader: 'sass-loader',
							options: {
								sourceMap: true
							}
						},
						{
							loader: 'sass-resources-loader',
							options: {
								sourceMap: true,
								resources: [
									path.resolve(__dirname, 'src/style/variables.scss'),
								]
							}
						}
					]
				},
				{
					// required to prevent errors from Svelte on Webpack 5+
					test: /node_modules\/svelte\/.*\.mjs$/,
					resolve: {
						fullySpecified: false
					}
				}
			]
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: "public/index.html",
				title: "Svelte app",
				inject: "body",
				scriptLoading: "blocking",
				chunks: ["main"]
			}),
			new InterpolateHtmlPlugin({
				'PUBLIC_URL': PUBLIC_URL
			}),
			new CopyWebpackPlugin({
				patterns: [{
					from: "public/**/*",
					to: outputPath
				}, ],
			}),
		],
		devtool: prod ? false : 'source-map',
		devServer: {
			static: {
				directory: path.join(__dirname, "public"),
			},
			open: true,
			hot: true,

			// proxy: {
			// 	'/api': 'http://localhost:3000',
			//   },
		}
	};

	return config;

}