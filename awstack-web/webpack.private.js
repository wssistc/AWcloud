"use strict";

let webpack = require("webpack");
let ExtractTextPlugin = require("extract-text-webpack-plugin");

//let LessExtractText = new ExtractTextPlugin("./css/[name].css");

module.exports = {
	context: __dirname,
	entry: {
		"white": [
			"./src/less/white.less"
		],
		"black": [
			"./src/less/black.less"
		],
		"index": [
			"./src/js/component.js",
			"./src/js/index.js",
		],
		"auth": [
			"./src/js/auth/auth.js"
		],
        "vmware": [
            "./src/vmware/js/index.js",
            "./src/less/vmware/index.less"
        ],
        "qcloud": [
            "./src/qcloud/js/index.js",
            "./src/less/qcloud/index.less"
        ],
        "tongyou": [
            "./src/less/tongyou/index.less"
        ],
		"common": [
			"./src/js/common.js",
			"./src/less/common.less"
		],
		"register":[
			"./src/js/registerprivate/app.js",
			"./src/less/register/global.less"
		],
		"minpcmonitor":[
			"./src/js/minpcmonitor/app.js",
			"./src/less/minpcmonitor/global.less"
		],
		"maxscreen":[
			"./src/js/maxscreen/app.js",
			"./src/less/maxscreen/global.less"
		],
		"handbook":[
			"./src/handbook/js/index.js",
			"./src/less/handbook/index.less"
		]
	},
	output: {
		path: `${__dirname}/built`,
		public: "/",
		filename: "./js/[name].js"
	},
	devtool: "source-map",
	module: {
        preLoaders: [{
            test: /\.js$/, exclude: /node_modules/, loader: "eslint"
        }],
        loaders: [
            { test: /\.js$/, exclude: /node_modules|src\/flow|thegraph/, loader: "babel" },
            //{ test: /\.js$/, exclude: /node_modules/, loader: "eslint" },
            //{ test: require.resolve("jquery"), loader: "expose?$!expose?jQuery" },
            { test: require.resolve("ip"), loader: "expose?_IP" },
            { test: require.resolve("ipaddr.js"), loader: "expose?_IPAddr" },
            //{ test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/, loader: 'url-loader?name=[path][name].[ext]'},
            { test: /\.gif|png|jpg|jpeg|svg|ttf|woff2?|eot/,exclude: /src\/flow|thegraph/, loader: "file",
                query: {
                    name: "/img/[name].[ext]"
                }
            },
            //{ test: /\.less$/, loader: "less" },
            { test: /\.less$/,exclude: /src\/flow|thegraph/, loader: ExtractTextPlugin.extract(["css", "less"]) }
        ],
        
    },
    eslint: {
        //configFile: './.eslintrc.js', // 指定eslint的配置文件在哪里
        failOnWarning: true, // eslint报warning了就终止webpack编译
        failOnError: true, // eslint报error了就终止webpack编译
        cache: false // 开启eslint的cache，cache存在node_modules/.cache目录里
    },
	plugins: [
		new ExtractTextPlugin("./css/[name].css")/*,
		new webpack.optimize.UglifyJsPlugin({
			//压缩代码
			compress: {
				warnings: false
			},
			mangle: false
			// except: ['$super', '$', 'exports', 'require']	//排除关键字
		})*/
	],
	devServer: {
		port: 22555,
		host: "0.0.0.0",
        disableHostCheck: true,
		contentBase: `${__dirname}/src`,
		info: true
	}
};