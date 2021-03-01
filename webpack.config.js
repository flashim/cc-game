const path = require("path");

module.exports = {
    mode: 'production',
    entry: "./src/index.js",
    devServer: {
        // Display only errors to reduce the amount of output.
        stats: "errors-only",

        // Parse host and port from env to allow customization.
        //
        // If you use Docker, Vagrant or Cloud9, set host: options.host || "0.0.0.0";
        //
        // 0.0.0.0 is available to all network devices unlike default `localhost`.
        /*
        host: process.env.HOST, // Defaults to `localhost`
        port: process.env.PORT, // Defaults to 8080
         */
        hot: true,
        overlay: true,
        open: true, // Open the page in browser
    },
    output: {
        path: path.resolve(__dirname, "public/assets/js"),
        filename: "bundle.js"
    }/* ,
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["babel-preset-env"]
                    }
                }
            }, {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    } */
};