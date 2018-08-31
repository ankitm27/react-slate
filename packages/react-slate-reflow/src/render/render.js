/* @flow */

import Row from './Row';
import type { RenderElement, StyleProps, Size } from '../types';

function fill(rows, index, maxWidth) {
  for (let i = 0; i <= index; i++) {
    // eslint-disable-next-line no-param-reassign
    rows[i] = rows[i] || new Row(maxWidth);
  }
}

export default function render(elements: RenderElement[], canvasSize: Size) {
  const rows = [];
  const { width: maxWidth, height: maxHeight } = canvasSize;

  elements.forEach(element => {
    if (!element.body && !element.box) {
      return;
    }

    const elementHeight = element.box ? element.box.height : 1;
    // $FlowFixMe
    const y = (element.box || element.body).y;

    for (
      let rowIndex = y;
      rowIndex >= 0 &&
      rowIndex < elementHeight + y &&
      (maxHeight < 0 || y + 1 <= maxHeight);
      rowIndex++
    ) {
      if (!rows[rowIndex]) {
        fill(rows, rowIndex, maxWidth);
      }

      const row = rows[rowIndex];
      if (element.body) {
        row.setText({
          value: element.body.value,
          start: element.body.x,
          length: element.body.value.length,
          // $FlowFixMe
          style: normalizeStyle(element.body.style),
        });
      } else if (element.box) {
        row.applyStyle({
          start: element.box.x,
          // $FlowFixMe
          length: element.box.width,
          // $FlowFixMe
          style: normalizeStyle(element.box.style),
        });
      }
    }
  });

  return rows.map(row => row.toString()).join('\n');
}

function normalizeStyle(style: ?StyleProps): { [key: string]: string } {
  return (
    Object.keys(style || {})
      // $FlowFixMe
      .filter(key => style[key])
      // $FlowFixMe
      .reduce((acc, key) => ({ ...acc, [key]: style[key] }), {})
  );
}
