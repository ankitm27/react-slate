/* @flow */

import assert from 'assert';
import type { Child, Traversable } from '../types';
import calculateLayout from '../layout/calculateLayout';

type Size = {
  width: number,
  height: number,
};

export default class Root implements Traversable<Child> {
  children: Array<Traversable<Child>> = [];
  size: Size;

  constructor(size: Size) {
    this.size = size;
  }

  prependChild(child: Child, childBefore: Child) {
    // eslint-disable-next-line no-param-reassign
    child.parent = this;
    const index = this.children.indexOf(childBefore);
    this.children.splice(index, 0, child);
  }

  appendChild(child: Child) {
    // eslint-disable-next-line no-param-reassign
    child.parent = this;
    this.children.push(child);
  }

  insertChild(child: Child, position?: number) {
    const index =
      typeof position !== 'undefined' ? position : this.children.length;

    assert(index <= this.children.length + 1, 'child position out of bounds');

    // eslint-disable-next-line no-param-reassign
    child.parent = this;
    this.children[index] = child;
  }

  removeChild(child: Child) {
    const index = this.children.indexOf(child);

    assert(
      index >= 0 && index < this.children.length,
      `child position out of bounds: ${index}`
    );

    // eslint-disable-next-line no-param-reassign
    child.parent = null;

    this.children.splice(index, 1);
  }

  calculateLayout() {
    return calculateLayout(this);
  }
}
