/* @flow */

import UnitLayout from './UnitLayout';
import RootLayout from './RootLayout';
import Dimensions from '../Dimensions';
import normalizeLayoutProps from '../normalizeLayoutProps';
import { makeBlockStyle } from '../makeStyle';
import type Node from '../../nodes/Node';
import type { Bounds, LayoutBuilder, Placement } from '../../types';

export default class ContainerLayout implements LayoutBuilder {
  node: Node;
  parentLayout: ContainerLayout | RootLayout;
  children: Array<ContainerLayout | UnitLayout> = [];
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
  lastChildLayout: ?(ContainerLayout | UnitLayout) = null;
  isInline: boolean = false;

  constructor(node: Node, parentLayout: ContainerLayout | RootLayout) {
    this.node = node;
    this.parentLayout = parentLayout;

    parentLayout && parentLayout.children.push(this);
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
      if (getWidthConstrain) {
        // Set width constrain and use parent's width to calculate current
        // element's width.
        this.dimensions.setWidthConstrain(getWidthConstrain(this));
        this.dimensions.width = this.parentLayout.dimensions.width;
      }
      if (getHeightConstrain) {
        // Set height constrain and use parent's height to calculate current
        // element's height.
        this.dimensions.setHeightConstrain(getHeightConstrain(this));
        this.dimensions.height = this.parentLayout.dimensions.height;
      }
    }
  }

  calculatePlacement() {
    const isPreviousLayoutInline =
      this.parentLayout.lastChildLayout instanceof UnitLayout ||
      (this.parentLayout.lastChildLayout instanceof ContainerLayout &&
        this.parentLayout.lastChildLayout.isInline);

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
        this.dimensions.width + this.insetBounds.left + this.insetBounds.right,
      height:
        this.dimensions.height + this.insetBounds.top + this.insetBounds.bottom,
    };
  }

  calculateDimensions(childLayout: ContainerLayout | UnitLayout) {
    const childDimensions = childLayout.getDimensionsWithBounds();
    const isChildLayoutInline =
      childLayout instanceof UnitLayout ||
      (childLayout instanceof ContainerLayout && childLayout.isInline);
    const isLastChildElementInline =
      this.lastChildLayout instanceof UnitLayout ||
      (this.lastChildLayout instanceof ContainerLayout &&
        this.lastChildLayout.isInline);

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
  }

  shouldMakeRenderElement() {
    return this.node.styleProps && this.node.styleProps.backgroundColor;
  }

  makeRenderElement() {
    return {
      box: {
        style: makeBlockStyle(this.node.styleProps),
        ...this.placement,
        ...this.getOwnDimensions(),
      },
    };
  }

  getJsonTree() {
    return {
      type: `${ContainerLayout.name}${this.isInline ? '(inline)' : ''}`,
      dimensions: this.getOwnDimensions(),
      placement: this.placement,
      children: this.children.map((child: ContainerLayout | UnitLayout) =>
        child.getJsonTree()
      ),
    };
  }
}
