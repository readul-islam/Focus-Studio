const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');
const packagesRoot = path.resolve(workspaceRoot, 'packages');
const mobileModules = path.resolve(projectRoot, 'node_modules');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [
  path.resolve(packagesRoot, 'shared'),
  path.resolve(packagesRoot, 'api-client'),
];

// ONLY use mobile/node_modules — never walk up to monorepo root node_modules
config.resolver.nodeModulesPaths = [mobileModules];

config.resolver.extraNodeModules = {
  react: path.join(mobileModules, 'react'),
  'react-dom': path.join(mobileModules, 'react-dom'),
};

// Block monorepo root react so Metro never resolves a duplicate copy
const rootReact = path.resolve(workspaceRoot, 'node_modules', 'react');
config.resolver.blockList = [
  new RegExp(`${rootReact.replace(/[/\\]/g, '[/\\\\]')}.*`),
];

const REACT_PREFIXES = ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (REACT_PREFIXES.some(prefix => moduleName === prefix || moduleName.startsWith(`${prefix}/`))) {
    return {
      filePath: require.resolve(moduleName, { paths: [mobileModules] }),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
