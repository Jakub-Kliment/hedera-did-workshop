const webpack = require("webpack");

module.exports = function override(config) {
  config.resolve.fallback = {
    crypto: require.resolve("crypto-browserify"),
    path: require.resolve("path-browserify"),
    os: require.resolve("os-browserify/browser"),
    stream: require.resolve("stream-browserify"),
    process: require.resolve("process/browser.js"),  // Add .js extension for process
  };

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser.js",  // Ensure the extension is .js
      Buffer: ["buffer", "Buffer"],
    }),
  ]);

  return config;
};
