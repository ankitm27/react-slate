/* @flow */

import assert from 'assert';
import type {
  Child,
  Parent,
  LayoutProps,
  StyleProps,
  BorderProps,
  Traversable,
} from '../types';

export default class Node implements Traversable<Child> {
  parent: ?Parent = null;
  children: Array<Traversable<Child>> = [];

  layoutProps: ?LayoutProps = null;
  styleProps: ?StyleProps = null;
  borderProps: ?BorderProps = null;

  constructor({ parent }: { parent: Node } = {}) {
    if (parent) {
      this.parent = parent;
    }
  }

  setLayoutProps(layoutProps: ?LayoutProps) {
    this.layoutProps = layoutProps;
  }

  setStyleProps(styleProps: ?StyleProps) {
    this.styleProps = styleProps;
  }

  setBorder(borderProps: ?BorderProps) {
    this.borderProps = borderProps;
    // $FlowFixMe
    assert.fail('missing implementation');
    // TODO: transform children tree to account for border
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

    assert(
      index <= this.children.length + 1,
      `child position out of bounds: ${index}`
    );

    // eslint-disable-next-line no-param-reassign
    child.parent = this;
    this.children[index] = child;
  }

  removeChild(child: Child) {
    const index = this.children.indexOf(child);

    assert(index >= 0, 'child not found');

    // eslint-disable-next-line no-param-reassign
    child.parent = null;
    this.children.splice(index, 1);
  }
}
