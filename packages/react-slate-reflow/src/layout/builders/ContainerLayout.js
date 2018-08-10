/* @flow */

import UnitLayout from './UnitLayout';
import RootLayout from './RootLayout';
import Dimensions from '../Dimensions';
import normalizeLayoutProps from '../normalizeLayoutProps';
import { makeBlockStyle } from '../makeStyle';
import type Node from '../../nodes/Node';
import BorderLayout from './BorderLayout';
import type {
  Bounds,
  Placement,
  ContainerLayoutBuilder,
  UnitLayoutBuilder,
} from '../../types';

function isLayoutInline(layout) {
  return layout && layout.isInline;
}

export default class ContainerLayout implements ContainerLayoutBuilder {
  node: Node;
  parentLayout: ContainerLayout | RootLayout;
  children: Array<ContainerLayout | BorderLayout | UnitLayout> = [];
  placement: Placement = { x: 0, y: 0 };
  dimensions = new Dimensions();
  insetBounds: Bounds = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  outsetBounds: Bounds = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  lastChildLayout: ?(ContainerLayoutBuilder | UnitLayoutBuilder) = null;
  isInline: boolean = false;

  constructor(node: Node, parentLayout: ContainerLayout | RootLayout) {
    this.node = node;
    this.parentLayout = parentLayout;
    parentLayout && parentLayout.children.push(this);

    this.applyParentConstrains();

    if (node && node.layoutProps) {
      const {
        insetBounds,
        outsetBounds,
        isInline,
        getWidthConstrain,
        getHeightConstrain,
      } = normalizeLayoutProps(node.layoutProps);
      this.insetBounds = insetBounds;
      this.outsetBounds = outsetBounds;
      this.isInline = isInline;
      this.applyOwnConstrains({ getWidthConstrain, getHeightConstrain });
    }

    if (this.isInline && this.parentLayout.dimensions.constrains.forWidth) {
      // If current container element is inline, usedWidth must be copied from
      // parent element.
      this.dimensions.usedWidth = this.parentLayout.dimensions.usedWidth;
    } else if (this.parentLayout.dimensions.constrains.forWidth) {
      // Reset usedWidth if current element is not inline, since it will
      // push content to the next line.
      this.parentLayout.dimensions.usedWidth = 0;
    }
  }

  /**
   * Set constrains from parent to propagate them down
   */
  applyParentConstrains() {
    if (this.parentLayout.dimensions.constrains.forWidth) {
      this.dimensions.setConstrain(
        'width',
        this.parentLayout.dimensions.fixedWidth,
        this.insetBounds
      );
    }
    if (this.parentLayout.dimensions.constrains.forHeight) {
      this.dimensions.setConstrain(
        'height',
        this.parentLayout.dimensions.availableHeight,
        this.insetBounds
      );
    }
  }

  applyOwnConstrains({
    getWidthConstrain,
    getHeightConstrain,
  }: {
    getWidthConstrain: ?(ContainerLayout, number) => number,
    getHeightConstrain: ?(ContainerLayout, number) => number,
  }) {
    if (getWidthConstrain) {
      // Get current element fixed width from parent's width.
      const ownFixedWidth = getWidthConstrain(
        this,
        this.parentLayout.dimensions.finalWidth
      );

      // Make sure current element won't overflow. Only apply
      // own fixed width if parent either doesn't have any
      // constrain or parent's fixed width is grater/equal own
      // fixed width.
      if (
        !this.parentLayout.dimensions.constrains.forWidth ||
        this.parentLayout.dimensions.fixedWidth >= ownFixedWidth
      ) {
        this.dimensions.setConstrain('width', ownFixedWidth, this.insetBounds);
      }
    }
    if (getHeightConstrain) {
      // Get current element fixed height from parent's height.
      const ownFixedHeight = getHeightConstrain(
        this,
        this.parentLayout.dimensions.finalHeight
      );

      // Make sure current element won't overflow. Only apply
      // own fixed height if parent either doesn't have any
      // constrain or parent's fixed height is grater/equal own
      // fixed height.
      if (
        !this.parentLayout.dimensions.constrains.forHeight ||
        this.parentLayout.dimensions.fixedHeight >= ownFixedHeight
      ) {
        this.dimensions.setConstrain(
          'height',
          ownFixedHeight,
          this.insetBounds
        );
      }
    }
  }

  calculatePlacement() {
    const isPreviousLayoutInline = isLayoutInline(
      this.parentLayout.lastChildLayout
    );

    if (!this.isInline || !isPreviousLayoutInline) {
      // Block placement
      this.placement = {
        x:
          this.parentLayout.placement.x +
          this.parentLayout.insetBounds.left +
          this.outsetBounds.left,
        y:
          this.parentLayout.placement.y +
          this.parentLayout.insetBounds.top +
          this.parentLayout.dimensions.height +
          this.outsetBounds.top,
      };
    } else {
      // Inline placement
      this.placement = {
        x:
          this.parentLayout.placement.x +
          this.parentLayout.insetBounds.left +
          this.parentLayout.dimensions.width +
          this.outsetBounds.left,
        y:
          this.parentLayout.placement.y +
          this.parentLayout.insetBounds.top +
          this.outsetBounds.top,
      };
    }
  }

  /**
   * Get dimensions with both outset and inset bounds.
   * For parent layout element, this layout element's height and width
   * should include outset bounds also.
   */
  getDimensionsWithBounds() {
    const ownDimensions = this.getOwnDimensions();
    return {
      width:
        this.outsetBounds.left + ownDimensions.width + this.outsetBounds.right,
      height:
        this.outsetBounds.top + ownDimensions.height + this.outsetBounds.bottom,
    };
  }

  /**
   * Get dimensions with inset bounds.
   * Inset bounds are part of this layout element's height and width.
   */
  getOwnDimensions() {
    return {
      width:
        this.dimensions.finalWidth +
        this.insetBounds.left +
        this.insetBounds.right,
      height:
        this.dimensions.finalHeight +
        this.insetBounds.top +
        this.insetBounds.bottom,
    };
  }

  calculateDimensions(childLayout: ContainerLayoutBuilder | UnitLayoutBuilder) {
    const childDimensions = childLayout.getDimensionsWithBounds();
    const isChildLayoutInline = isLayoutInline(childLayout);
    const isLastChildElementInline = isLayoutInline(this.lastChildLayout);

    if (!this.lastChildLayout) {
      // First child in this parent layout.
      this.dimensions.width = childDimensions.width;
      this.dimensions.height = childDimensions.height;
    } else if (!isChildLayoutInline || !isLastChildElementInline) {
      // Either the child is a block element or previous child was a block element.
      this.dimensions.width = Math.max(
        this.dimensions.width,
        childDimensions.width
      );
      this.dimensions.height += childDimensions.height;
    } else {
      // Both child and previous child are an inline elements.
      this.dimensions.width += childDimensions.width;
      this.dimensions.height = Math.max(
        this.dimensions.height,
        childDimensions.height
      );
    }
    this.lastChildLayout = childLayout;

    // NOTE: add comment
    if (
      (childLayout instanceof ContainerLayout ||
        childLayout instanceof BorderLayout) &&
      this.dimensions.constrains.forHeight
    ) {
      this.dimensions.usedHeight += childLayout.dimensions.finalHeight;
    }
  }

  shouldMakeRenderElements() {
    return this.node.styleProps && this.node.styleProps.backgroundColor;
  }

  makeRenderElements() {
    return [
      {
        box: {
          style: makeBlockStyle(this.node.styleProps),
          ...this.placement,
          ...this.getOwnDimensions(),
        },
      },
    ];
  }

  getJsonTree() {
    return {
      type: `${ContainerLayout.name}${this.isInline ? '(inline)' : ''}`,
      dimensions: this.getOwnDimensions(),
      placement: this.placement,
      children: this.children.map(
        (child: ContainerLayout | BorderLayout | UnitLayout) =>
          child.getJsonTree()
      ),
    };
  }
}
