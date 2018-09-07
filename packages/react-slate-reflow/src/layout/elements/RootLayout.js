/* @flow */

import ContainerLayout from './ContainerLayout';
import BoxModel from '../lib/BoxModel';
import type { LayoutElement, LayoutElementDelegate } from '../../types';

export default class RootLayout implements LayoutElement<null> {
  backingInstance: LayoutElement<null>;

  node = null;
  parent: LayoutElement<*> | LayoutElementDelegate<*>;
  children = [];
  lastChild = null;

  boxModel = new BoxModel();
  isInline = false;
  isAbsolute = false;

  constructor() {
    this.backingInstance = this;
  }

  getBoxModel() {
    return this.boxModel;
  }

  updateDimensions(childLayout: LayoutElement<*> | LayoutElementDelegate<*>) {
    // If child layout is absolute the update logic can be simplified to
    // simply take the grater value. Additionally, placement x and y must
    // be taken into account also since they correspond to `left` and `top` values.
    if (childLayout.backingInstance.isAbsolute) {
      // const {
      //   width: childWidth,
      //   height: childHeight,
      // } = childLayout
      //   .getDimensions()
      //   .getSize(
      //     childLayout.backingInstance.insetBounds,
      //     childLayout.backingInstance.outsetBounds
      //   );
      // this.dimensions.calculateFromAbsoluteElement({
      //   width: childWidth + childLayout.backingInstance.placement.x,
      //   height: childHeight + childLayout.backingInstance.placement.y,
      // });
    } else {
      ContainerLayout.prototype.updateDimensions.call(this, childLayout);
    }
  }

  isDrawable() {
    return false;
  }

  getDrawableItems() {
    return [];
  }

  getLayoutTree() {
    return {
      type: RootLayout.name,
      dimensions: this.boxModel.getSize(),
      placement: this.boxModel.getPosition(),
      // $FlowFixMe
      children: this.children.map((child: LayoutElement<*>) =>
        child.getLayoutTree()
      ),
    };
  }
}
