import * as React from 'react';
import * as ReactDOM from 'react-dom/server';
import Html from './helpers/Html';

export default function () {
  return `<!doctype html>${ReactDOM.renderToStaticMarkup(<Html />)}`;
}
