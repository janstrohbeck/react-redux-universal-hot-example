#!/usr/bin/env ts-node
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
/**
 * Define isomorphic constants.
 */
(global as any).__CLIENT__ = false;
(global as any).__SERVER__ = true;
(global as any).__DISABLE_SSR__ = false; // <----- DISABLES SERVER SIDE RENDERING FOR ERROR DEBUGGING
(global as any).__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';
(global as any).__DLLS__ = process.env.WEBPACK_DLLS === '1';

(() => {
  if ((global as any).__DEVELOPMENT__) {
    if (
      !require('piping')({
        hook: true,
        ignore: /(\/\.|~$|\.json|\.scss$)/i
      })
    ) {
      return;
    }
  }

  // https://github.com/halt-hammerzeit/webpack-isomorphic-tools
  const WebpackIsomorphicTools = require('webpack-isomorphic-tools');
  (global as any).webpackIsomorphicTools = new WebpackIsomorphicTools(
    require('../webpack/webpack-isomorphic-tools')
  ).server(rootDir, () => {
    require('../src/server');
  });
})()