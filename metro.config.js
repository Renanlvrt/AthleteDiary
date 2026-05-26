// metro.config.js — Required for Expo SDK + expo-router + web + 3D assets
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow Metro to bundle .glb / .gltf / .bin 3D model files
config.resolver.assetExts.push('glb', 'gltf', 'bin');

module.exports = config;
