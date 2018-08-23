/* @flow */

import Row from './Row';
import type { RenderElement, StyleProps, Size } from '../types';

export default function render(elements: RenderElement[], canvasSize: Size) {
  const rows = [];
  for (let i = 0; i < canvasSize.height; i++) {
    rows[i] = new Row(canvasSize.width);
  }

  elements.forEach(element => {
    if (!element.body && !element.box) {
      return;
    }
    const height = element.box ? element.box.height : 1;
    // $FlowFixMe
    const y = (element.box || element.body).y;
    for (
      let i = 0;
      i < height && y + i >= 0 && y + 1 <= canvasSize.height;
      i++
    ) {
      const row = rows[y + i];
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
