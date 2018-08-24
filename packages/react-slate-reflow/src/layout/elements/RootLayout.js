/* @flow */

import ContainerLayout from './ContainerLayout';
import { makeEmptyDimensions, withBounds } from '../lib/dimensions';
import Placement from '../lib/Placement';
import type { LayoutElement, LayoutElementDelegate } from '../../types';

export default class RootLayout implements LayoutElement<null> {
  backingInstance: LayoutElement<null>;

  node = null;
  parent: LayoutElement<*> | LayoutElementDelegate<*>;
  children = [];
  lastChild = null;

  dimensions = makeEmptyDimensions();
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
      const childDimensions = childLayout.getDimensions();
      const { width: childWidth, height: childHeight } = withBounds(
        {
          width: childDimensions.finalWidth,
          height: childDimensions.finalHeight,
        },
        childLayout.backingInstance.insetBounds,
        childLayout.backingInstance.outsetBounds
      );
      this.dimensions.measuredWidth = Math.max(
        this.dimensions.measuredWidth,
        childWidth + childLayout.backingInstance.placement.x
      );
      this.dimensions.measuredHeight = Math.max(
        this.dimensions.measuredHeight,
        childHeight + childLayout.backingInstance.placement.y
      );
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
    const { finalWidth, finalHeight } = this.getDimensions();
    return {
      type: RootLayout.name,
      dimensions: {
        width: finalWidth,
        height: finalHeight,
      },
      placement: this.placement.valueOf(),
      // $FlowFixMe
      children: this.children.map((child: LayoutElement<*>) =>
        child.getLayoutTree()
      ),
    };
  }
}
