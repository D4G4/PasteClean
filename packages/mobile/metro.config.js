const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo so workspace packages resolve.
// Extend (don't replace) Expo's defaults so expo-router's typed-routes and
// other Expo internals keep watching their own paths.
config.watchFolders = [...(config.watchFolders ?? []), monorepoRoot];

// Let Metro resolve packages from the monorepo root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Redirect cheerio → cheerio/slim to avoid node:stream import
// cheerio/slim has the same load() API but without Node.js streaming dependencies
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'cheerio') {
    return context.resolveRequest(context, 'cheerio/slim', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
