/* @flow */

import { makeInlineStyle } from '../makeStyle';
import Dimensions from '../Dimensions';
import type ContainerLayout from './ContainerLayout';
import type Text from '../../nodes/Text';
import type { UnitLayoutBuilder, Placement } from '../../types';

export default class UnitLayout implements UnitLayoutBuilder {
  isInline: boolean = true;
  parentLayout: ContainerLayout;
  node: Text;
  placement: Placement = { x: 0, y: 0 };
  dimensions = new Dimensions();

  constructor(node: Text, parentLayout: ContainerLayout) {
    this.node = node;
    this.parentLayout = parentLayout;
    parentLayout.children.push(this);
    this.dimensions.width = node.body.length;
    this.dimensions.height = 1;
  }

  calculatePlacement() {
    if (this.parentLayout.lastChildLayout instanceof UnitLayout) {
      this.placement = {
        x: this.parentLayout.placement.x + this.parentLayout.dimensions.width,
        y: this.parentLayout.placement.y,
      };
    } else {
      this.placement = {
        x: this.parentLayout.placement.x,
        y: this.parentLayout.placement.y + this.parentLayout.dimensions.height,
      };
    }
    this.placement.x += this.parentLayout.insetBounds.left;
    this.placement.y += this.parentLayout.insetBounds.top;
  }

  getDimensionsWithBounds() {
    return this.dimensions;
  }

  makeRenderElement() {
    if (this.parentLayout.dimensions.shouldSkip()) {
      return null;
    }

    const { textAlign } = this.parentLayout.node.styleProps || {};
    const value = this.parentLayout.dimensions.trimHorizontally(
      this.node.body,
      textAlign
    );
    return {
      body: {
        value,
        style: makeInlineStyle(collectStyleProps(this)),
        ...this.placement,
      },
    };
  }

  getJsonTree() {
    return {
      type: UnitLayout.name,
      dimensions: this.dimensions.valueOf(),
      placement: this.placement,
      body: this.node.body,
    };
  }
}

function collectStyleProps(layout: UnitLayout) {
  const styleProps = [];
  let currentLayout = layout.parentLayout;
  while (currentLayout && currentLayout.node) {
    if (currentLayout.node.styleProps) {
      const {
        backgroundColor,
        ...inlineStyleProps
      } = currentLayout.node.styleProps;
      styleProps.push(inlineStyleProps);
    }
    currentLayout = currentLayout.parentLayout || null;
  }
  return styleProps.reverse();
}
