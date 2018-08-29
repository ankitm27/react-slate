/* @flow */

import ContainerLayout from './ContainerLayout';
import Dimensions from '../lib/Dimensions';
import Placement from '../lib/Placement';
import type { LayoutElement, LayoutElementDelegate } from '../../types';

export default class RootLayout implements LayoutElement<null> {
  backingInstance: LayoutElement<null>;

  node = null;
  parent: LayoutElement<*> | LayoutElementDelegate<*>;
  children = [];
  lastChild = null;

  dimensions = new Dimensions();
  placement = new Placement();
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
  isAbsolute = false;

  constructor() {
    this.backingInstance = this;
  }

  getDimensions() {
    return this.dimensions;
  }

  updateDimensions(childLayout: LayoutElement<*> | LayoutElementDelegate<*>) {
    // If child layout is absolute the update logic can be simplified to
    // simply take the grater value. Additionally, placement x and y must
    // be taken into account also since they correspond to `left` and `top` values.
    if (childLayout.backingInstance.isAbsolute) {
      const {
        width: childWidth,
        height: childHeight,
      } = childLayout
        .getDimensions()
        .getSize(
          childLayout.backingInstance.insetBounds,
          childLayout.backingInstance.outsetBounds
        );
      this.dimensions.calculateFromAbsoluteElement({
        width: childWidth + childLayout.backingInstance.placement.x,
        height: childHeight + childLayout.backingInstance.placement.y,
      });
    } else {
      ContainerLayout.prototype.updateDimensions.call(this, childLayout);
    }
  }

  hasRenderElements() {
    return false;
  }

  getRenderElements() {
    return [];
  }

  getLayoutTree() {
    return {
      type: RootLayout.name,
      dimensions: this.getDimensions().getSize(),
      placement: this.placement.valueOf(),
      // $FlowFixMe
      children: this.children.map((child: LayoutElement<*>) =>
        child.getLayoutTree()
      ),
    };
  }
}
