/* @flow */

import Dimensions from '../lib/Dimensions';
import Placement from '../lib/Placement';
import normalizeLayoutProps from '../lib/normalizeLayoutProps';
import { makeBlockStyle } from '../lib/makeStyle';
import type View from '../../nodes/View';
import type { LayoutElement, LayoutElementDelegate } from '../../types';

function isLayoutInline(
  layout: ?(LayoutElement<*> | LayoutElementDelegate<*>)
) {
  return Boolean(layout && layout.backingInstance.isInline);
}

export default class ContainerLayout implements LayoutElement<View> {
  backingInstance: LayoutElement<*>;

  node: View;
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

  constructor(node: View, parent: LayoutElement<*>) {
    this.backingInstance = this;
    this.node = node;
    this.parent = parent;
    parent.backingInstance.children.push(this);

    let getWidthConstrain;
    let getHeightConstrain;
    if (node && node.layoutProps) {
      const normalizedProps = normalizeLayoutProps(node.layoutProps);
      const {
        insetBounds,
        outsetBounds,
        isInline,
        isAbsolute,
        placement,
      } = normalizedProps;
      getWidthConstrain = normalizedProps.getWidthConstrain;
      getHeightConstrain = normalizedProps.getHeightConstrain;
      this.insetBounds = insetBounds;
      this.outsetBounds = outsetBounds;
      this.isInline = isInline && !isAbsolute;
      this.isAbsolute = isAbsolute;
      if (this.isAbsolute) {
        this.placement.x = placement.x;
        this.placement.y = placement.y;
        this.placement.z = placement.z;
      }
    }

    this.dimensions.setMaxDimensions({
      isAbsolute: this.isAbsolute,
      isInline: this.isInline,
      isSwitching:
        this.isInline !== isLayoutInline(this.parent.backingInstance.lastChild),
      insetBounds: this.insetBounds,
      parentDimensions: this.parent.backingInstance.getDimensions(),
    });

    this.dimensions.setOwnConstrains({
      getWidthConstrain,
      getHeightConstrain,
      insetBounds: this.insetBounds,
      parentDimensions: this.parent.backingInstance.getDimensions(),
    });

    // Calculate placement if it's relatively positioned
    this.placement.initForContainerLayout({
      isAbsolute: this.isAbsolute,
      isInline: this.isInline,
      isPreviousLayoutInline: isLayoutInline(
        this.parent.backingInstance.lastChild
      ),
      outsetBounds: this.outsetBounds,
      parentPlacement: this.parent.backingInstance.placement,
      parentDimensions: this.parent.backingInstance.getDimensions(),
      parentInsetBounds: this.parent.backingInstance.insetBounds,
    });
  }

  getDimensions() {
    return this.dimensions;
  }

  updateDimensions(childLayout: LayoutElement<*> | LayoutElementDelegate<*>) {
    if (childLayout.backingInstance.isAbsolute) {
      // Absolute children have no dimensions from the parent point of view
      return;
    }

    const childDimensions = childLayout.getDimensions();
    const { width: childWidth, height: childHeight } = childDimensions.getSize(
      childLayout.backingInstance.insetBounds,
      childLayout.backingInstance.outsetBounds
    );
    const isChildLayoutInline = isLayoutInline(childLayout);
    const isLastChildElementInline = isLayoutInline(this.lastChild);
    // console.log(childLayout)
    if (!this.lastChild) {
      // First child in this parent layout.
      this.dimensions.calculateInitialDimensions({
        width: childWidth,
        height: childHeight,
      });
    } else if (!isChildLayoutInline || !isLastChildElementInline) {
      // Either the child is a block element or previous child was a block element.
      this.dimensions.calculateFromBlockElement({
        width: childWidth,
        height: childHeight,
      });
    } else {
      // Both child and previous child are an inline elements.
      this.dimensions.calculateFromInlineElement({
        width: childWidth,
        height: childHeight,
      });
    }
    this.lastChild = childLayout;
  }

  hasRenderElements() {
    return Boolean(
      this.node.styleProps && this.node.styleProps.backgroundColor
    );
  }

  getRenderElements() {
    const { width, height } = this.getDimensions().getSize(this.insetBounds);
    return [
      // If element has `backgroundColor`, in order to prevent overlapping background
      // elements to foreground we need to create fake body elements, which will cover the area.
      ...new Array(height).fill(null).map((e, index) => ({
        body: {
          value: ' '.repeat(width),
          style: null,
          x: this.placement.x,
          y: this.placement.y + index,
        },
      })),
      {
        box: {
          style: makeBlockStyle(this.node.styleProps),
          x: this.placement.x,
          y: this.placement.y,
          width,
          height,
        },
      },
    ];
  }

  getLayoutTree() {
    return {
      type: `${ContainerLayout.name}${this.isInline ? '(inline)' : ''}${
        this.isAbsolute ? '(absolute)' : ''
      }`,
      dimensions: this.getDimensions().getSize(this.insetBounds),
      placement: this.placement.valueOf(),
      // $FlowFixMe
      children: this.children.map((child: LayoutElement<*>) =>
        child.getLayoutTree()
      ),
    };
  }
}
