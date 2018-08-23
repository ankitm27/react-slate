/* @flow */

import {
  makeEmptyDimensions,
  withConstrain,
  withBounds,
} from '../lib/dimensions';
import normalizeLayoutProps from '../lib/normalizeLayoutProps';
import { makeBlockStyle } from '../lib/makeStyle';
import type View from '../../nodes/View';
import type { LayoutElement, LayoutElementDelegate } from '../../types';

function isLayoutInline(
  layout: ?(LayoutElement<*> | LayoutElementDelegate<*>)
) {
  return layout && layout.backingInstance.isInline;
}

export default class ContainerLayout implements LayoutElement<View> {
  backingInstance: LayoutElement<*>;

  node: View;
  parent: LayoutElement<*> | LayoutElementDelegate<*>;
  children = [];
  lastChild = null;

  dimensions = makeEmptyDimensions();
  placement = { x: 0, y: 0, z: 0 };
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
        this.placement = placement;
      }
    }

    // Set constrains from parent to propagate them down unless it's positioned absolutely
    if (
      !this.isAbsolute &&
      this.parent.backingInstance.dimensions.fixedWidth > -1
    ) {
      this.dimensions = withConstrain(
        this.dimensions,
        'width',
        this.parent.backingInstance.dimensions.fixedWidth,
        this.insetBounds
      );
    }
    if (
      !this.isAbsolute &&
      this.parent.backingInstance.dimensions.fixedHeight > -1
    ) {
      this.dimensions = withConstrain(
        this.dimensions,
        'height',
        this.parent.backingInstance.dimensions.availableHeight,
        this.insetBounds
      );
    }

    // Set own constrains
    if (getWidthConstrain) {
      // Get current element fixed width from parent's width.
      const ownFixedWidth = getWidthConstrain(
        this,
        this.parent.backingInstance.dimensions.finalWidth
      );

      // Make sure current element won't overflow. Only apply
      // own fixed width if parent either doesn't have any
      // constrain or parent's fixed width is grater/equal own
      // fixed width.
      if (
        this.parent.backingInstance.dimensions.fixedWidth === -1 ||
        this.parent.backingInstance.dimensions.fixedWidth >= ownFixedWidth
      ) {
        this.dimensions = withConstrain(
          this.dimensions,
          'width',
          ownFixedWidth,
          this.insetBounds
        );
      }
    }
    if (getHeightConstrain) {
      // Get current element fixed height from parent's height.
      const ownFixedHeight = getHeightConstrain(
        this,
        this.parent.backingInstance.dimensions.finalHeight
      );

      // Make sure current element won't overflow. Only apply
      // own fixed height if parent either doesn't have any
      // constrain or parent's fixed height is grater/equal own
      // fixed height.
      if (
        this.parent.backingInstance.dimensions.fixedHeight === -1 ||
        this.parent.backingInstance.dimensions.fixedHeight >= ownFixedHeight
      ) {
        this.dimensions = withConstrain(
          this.dimensions,
          'height',
          ownFixedHeight,
          this.insetBounds
        );
      }
    }

    if (
      this.isInline &&
      this.parent.backingInstance.dimensions.fixedWidth > -1
    ) {
      // If current container element is inline, usedWidth must be copied from
      // parent element.
      this.dimensions.usedWidth = this.parent.backingInstance.dimensions.usedWidth;
    } else if (
      !this.isAbsolute &&
      this.parent.backingInstance.dimensions.fixedWidth > -1
    ) {
      // Reset usedWidth if current element is not inline, since it will
      // push content to the next line.
      this.parent.backingInstance.dimensions.usedWidth = 0;
    }

    // Calculate placement if it's relatively positioned
    const isPreviousLayoutInline = isLayoutInline(
      this.parent.backingInstance.lastChild
    );

    if (!this.isAbsolute && (!this.isInline || !isPreviousLayoutInline)) {
      // Block placement
      this.placement.x =
        this.parent.backingInstance.placement.x +
        this.parent.backingInstance.insetBounds.left +
        this.outsetBounds.left;
      this.placement.y =
        this.parent.backingInstance.placement.y +
        this.parent.backingInstance.insetBounds.top +
        this.parent.backingInstance.dimensions.measuredHeight +
        this.outsetBounds.top;
    } else if (!this.isAbsolute) {
      // Inline placement
      this.placement.x =
        this.parent.backingInstance.placement.x +
        this.parent.backingInstance.insetBounds.left +
        this.parent.backingInstance.dimensions.measuredWidth +
        this.outsetBounds.left;
      this.placement.y =
        this.parent.backingInstance.placement.y +
        this.parent.backingInstance.insetBounds.top +
        this.outsetBounds.top;
    }
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
    const { width: childWidth, height: childHeight } = withBounds(
      {
        width: childDimensions.finalWidth,
        height: childDimensions.finalHeight,
      },
      childLayout.backingInstance.insetBounds,
      childLayout.backingInstance.outsetBounds
    );
    const isChildLayoutInline = isLayoutInline(childLayout);
    const isLastChildElementInline = isLayoutInline(this.lastChild);

    if (!this.lastChild) {
      // First child in this parent layout.
      this.dimensions.measuredWidth = childWidth;
      this.dimensions.measuredHeight = childHeight;
    } else if (!isChildLayoutInline || !isLastChildElementInline) {
      // Either the child is a block element or previous child was a block element.
      this.dimensions.measuredWidth = Math.max(
        this.dimensions.measuredWidth,
        childWidth
      );
      this.dimensions.measuredHeight += childHeight;
    } else {
      // Both child and previous child are an inline elements.
      this.dimensions.measuredWidth += childWidth;
      this.dimensions.measuredHeight = Math.max(
        this.dimensions.measuredHeight,
        childHeight
      );
    }
    this.lastChild = childLayout;

    // NOTE: add comment
    if (
      !childLayout.backingInstance.isInline &&
      this.dimensions.fixedHeight > -1
    ) {
      this.dimensions.usedHeight +=
        childLayout.backingInstance.dimensions.finalHeight;
    }
  }

  hasRenderElements() {
    return Boolean(
      this.node.styleProps && this.node.styleProps.backgroundColor
    );
  }

  getRenderElements() {
    const { finalHeight, finalWidth } = this.getDimensions();
    const { width, height } = withBounds(
      { width: finalWidth, height: finalHeight },
      this.insetBounds
    );
    return [
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
    const { finalHeight, finalWidth } = this.getDimensions();
    const { width, height } = withBounds(
      { width: finalWidth, height: finalHeight },
      this.insetBounds
    );
    return {
      type: `${ContainerLayout.name}${this.isInline ? '(inline)' : ''}${
        this.isAbsolute ? '(absolute)' : ''
      }`,
      dimensions: {
        width,
        height,
      },
      placement: this.placement,
      // $FlowFixMe
      children: this.children.map((child: LayoutElement<*>) =>
        child.getLayoutTree()
      ),
    };
  }
}
