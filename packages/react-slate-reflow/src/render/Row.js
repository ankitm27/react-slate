/* @flow */

import applyStyle from './applyStyle';

type Style = { [key: string]: string };
type Cell = {
  char: string,
  style: ?Style,
};

export default class Row {
  length: number;
  cells: Cell[] = [];

  constructor(length: number) {
    const fillValue = { char: ' ', style: null };
    for (let i = 0; i < length; i++) {
      this.cells[i] = { ...fillValue };
    }
  }

  setText({
    start,
    length,
    style,
    value,
  }: {
    start: number,
    length: number,
    style: ?Style,
    value: string,
  }) {
    for (let i = 0; i < length && start + i < this.cells.length; i++) {
      const cellIndex = start + i;
      this.cells[cellIndex].style = style
        ? {
            ...(this.cells[cellIndex].style || {}),
            ...style,
          }
        : this.cells[cellIndex].style;
      this.cells[cellIndex].char = value[i];
    }
  }

  applyStyle({
    start,
    length,
    style,
  }: {
    start: number,
    length: number,
    style: ?Style,
  }) {
    if (!style) {
      return;
    }

    this.setText({
      start,
      length,
      style,
      value: this.cells
        .slice(start, start + length)
        .map(cell => cell.char)
        .join(''),
    });
  }

  flatten() {
    const groups = [];
    let groupIndex = 0;

    this.cells.forEach(cell => {
      if (groups.length === 0) {
        groups.push({
          content: cell.char,
          style: cell.style ? { ...cell.style } : null,
        });
      } else if (areStylesEqual(groups[groupIndex].style, cell.style)) {
        groups[groupIndex].content += cell.char;
      } else {
        groupIndex++;
        groups[groupIndex] = {
          content: cell.char,
          style: cell.style ? { ...cell.style } : null,
        };
      }
    });

    return groups;
  }

  toString() {
    return this.flatten()
      .map(
        group =>
          group.style ? applyStyle(group.style, group.content) : group.content
      )
      .join('');
  }
}

function areStylesEqual(a, b) {
  if (typeof a !== typeof b) {
    return false;
  }

  if (a && b) {
    if (Object.keys(a).length !== Object.keys(b).length) {
      return false;
    }

    // $FlowFixMe
    return !Object.keys(a).find(keyA => a[keyA] !== b[keyA]);
  }

  return a === b;
}
