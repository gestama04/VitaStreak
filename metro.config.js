// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable experimental require.context support.
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// Support CommonJS files using the .cjs extension.
if (!config.resolver.sourceExts.includes('cjs')) {
  config.resolver.sourceExts.push('cjs');
}

// Preserve the existing package exports configuration.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;