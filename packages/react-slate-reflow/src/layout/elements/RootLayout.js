/* @flow */

import ContainerLayout from './ContainerLayout';
import { makeEmptyDimensions } from '../lib/dimensions';
import type { LayoutElement, LayoutElementDelegate } from '../../types';

export default class RootLayout implements LayoutElement<null> {
  backingInstance: LayoutElement<null>;

  node = null;
  parent: LayoutElement<*> | LayoutElementDelegate<*>;
  children = [];
  lastChild = null;

  dimensions = makeEmptyDimensions();
  placement = { x: 0, y: 0 };
  insetBounds = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  outsetBounds = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  isInline = false;

  constructor() {
    this.backingInstance = this;
  }

  getDimensions() {
    return this.dimensions;
  }

  updateDimensions(childLayout: *) {
    ContainerLayout.prototype.updateDimensions.call(this, childLayout);
  }

  hasRenderElements() {
    return false;
  }

  getRenderElements() {
    return [];
  }

  getLayoutTree() {
    const { finalWidth, finalHeight } = this.getDimensions();
    return {
      type: RootLayout.name,
      dimensions: {
        width: finalWidth,
        height: finalHeight,
      },
      placement: this.placement,
      // $FlowFixMe
      children: this.children.map((child: LayoutElement<*>) =>
        child.getLayoutTree()
      ),
    };
  }
}
