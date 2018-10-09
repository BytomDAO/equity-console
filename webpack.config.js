const webpack = require("webpack")
const path = require("path")
const { CheckerPlugin } = require("awesome-typescript-loader")

module.exports = {
  target: "web",
  entry: {
    playground: path.resolve(__dirname, "src/entry")
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bitcoin-playground.bundle.js",
    publicPath: "/equity/"
  },
  resolve: {
    modules: ["node_modules"],
    extensions: ["-browser.js", ".js", ".json", ".jsx", ".ts", ".tsx", ".pegjs"]
  },
  module: {
    rules: [
      {
        test: /\.json$/,
        use: ["json-loader"]
      },
      {
        test: /\.pegjs$/,
        use: ["pegjs-loader"]
      },
      {
        test: /\.tsx?$/,
        use: ["awesome-typescript-loader", "tslint-loader"]
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: ["file-loader"]
      },
      {
        test: /\.(png|jpg)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  devServer: {
    historyApiFallback: true,
    port: 9000,
    // Proxy API requests to local core server
    proxy: {
      '/api': {
        target: process.env.PROXY_API_HOST || 'http://localhost:9888/',
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
  plugins: [
    new CheckerPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new webpack.ProvidePlugin({
      // inject ES5 modules as global vars
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
      Tether: 'tether'
    })
  ]
}
