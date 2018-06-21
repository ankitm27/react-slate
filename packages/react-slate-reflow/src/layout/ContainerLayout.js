/* @flow */

import UnitLayout from './UnitLayout';
import Node from '../nodes/Node';
import normalizeLayoutProps from './normalizeLayoutProps';
import { makeBlockStyle } from './makeStyle';
import type { Bounds, LayoutBuilder, Placement, Dimensions } from '../types';

export default class ContainerLayout implements LayoutBuilder {
  node: Node;
  parentLayout: ContainerLayout;
  children: Array<ContainerLayout | UnitLayout> = [];
  placement: Placement = { x: 0, y: 0 };
  dimensions: Dimensions = { width: 0, height: 0 };
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

  constructor(node: Node, parentLayout: ContainerLayout) {
    this.node = node;
    this.parentLayout = parentLayout;

    parentLayout && parentLayout.children.push(this);
    if (node && node.layoutProps) {
      const { insetBounds, outsetBounds } = normalizeLayoutProps(
        node.layoutProps
      );
      this.insetBounds = insetBounds;
      this.outsetBounds = outsetBounds;
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
    // TODO: handle inline ContainerLayout
    const childDimensions = childLayout.getDimensionsWithBounds();
    if (childLayout instanceof ContainerLayout) {
      this.dimensions.width = Math.max(
        this.dimensions.width,
        childDimensions.width
      );
      this.dimensions.height += childDimensions.height;
    } else if (childLayout instanceof UnitLayout) {
      if (this.lastChildLayout instanceof ContainerLayout) {
        this.dimensions.width = Math.max(
          this.dimensions.width,
          childDimensions.width
        );
        this.dimensions.height += childDimensions.height;
      } else if (this.lastChildLayout instanceof UnitLayout) {
        this.dimensions.width += childDimensions.width;
      } else {
        this.dimensions.width = childDimensions.width;
        this.dimensions.height = childDimensions.height;
      }
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