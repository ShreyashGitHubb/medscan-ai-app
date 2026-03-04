
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
    // Adds support for `.bin` files for TensorFlow.js models
    'bin',
    // Adds support for `.tflite` files
    'tflite'
);

config.resolver.sourceExts.push(
    // Adds support for `.cjs` modules (used by some TFJS dependencies)
    'cjs'
);

module.exports = config;
