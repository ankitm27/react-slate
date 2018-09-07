/* @flow */

import render from './render';
import type { RenderElement, Size } from '../types';

export default function createDiffRenderer() {
  let previousRows = [];
  return function renderDiff(elements: RenderElement[], canvasSize: Size) {
    const rows = render(elements, canvasSize).split('\n');

    if (!previousRows.length) {
      previousRows = rows;
      return rows.reduce(
        (acc, row, index) => ({
          ...acc,
          [index]: row,
        }),
        {}
      );
    }

    const output = {};
    for (let i = 0; i < Math.max(previousRows.length, rows.length); i++) {
      if (previousRows[i] !== rows[i] && typeof rows[i] === 'string') {
        output[i] = rows[i];
      }
    }

    previousRows = rows;
    return output;
  };
}
