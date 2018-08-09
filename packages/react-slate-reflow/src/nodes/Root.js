/* @flow */

import Node from './Node';
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

  findChild(child: Child) {
    return Node.prototype.findChild.call(this, child);
  }

  prependChild(child: Child, position?: number) {
    return Node.prototype.prependChild.call(this, child, position);
  }

  appendChild(child: Child, position?: number) {
    return Node.prototype.appendChild.call(this, child, position);
  }

  removeChild(child: Child) {
    return Node.prototype.removeChild.call(this, child);
  }

  calculateLayout() {
    return calculateLayout(this);
  }
}
