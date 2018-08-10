import React from 'react';
import path from 'path';
import { renderToTerminal, renderToString, View } from '@react-slate/core';
import {
  hideCursor,
  clearScrollbackOnExit,
  overwriteConsole,
} from '@react-slate/utils';
import throttle from 'lodash.throttle';
// import App from './App';

// overwriteConsole({
//   outStream: path.join(__dirname, '../node_modules/.artifacts/stdout.log'),
//   errStream: path.join(__dirname, '../node_modules/.artifacts/stderr.log'),
// });
// hideCursor(process.stdout);
// clearScrollbackOnExit(process.stdout);

const App = () => (
  <View
    style={{
      borderStyle: 'single-line',
      padding: '1',
      margin: '1 0 0 2',
      backgroundColor: 'red',
      borderBackgroundColor: 'black',
      color: 'green',
      borderColor: 'cyan',
    }}
  >
    Hello world
  </View>
);

console.log(renderToString(<App />));

// process.on(
//   'resize',
//   throttle(() => {
//     renderToTerminal(<App />, process.stdout);
//   }, 100)
// );
