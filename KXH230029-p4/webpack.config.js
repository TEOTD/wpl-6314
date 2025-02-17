module.exports = {
    entry: {
        gettingStarted: "./gettingStarted.jsx",
        problem2: "./problem2.jsx",
        problem4: "./problem4.jsx",
        problem5: "./problem5.jsx",

    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ["babel-loader"],
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 8192,
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ["*", ".js", ".jsx"],
    },
    output: {
        path: `${__dirname}/compiled`,
        publicPath: "/",
        filename: "[name].bundle.js",
    },
    mode: "development",
};
