/* @flow */

import { makeInlineStyle } from '../lib/makeStyle';
import {
  makeEmptyDimensions,
  shouldSkip,
  trimHorizontally,
} from '../lib/dimensions';
import type Text from '../../nodes/Text';
import type { LayoutElement, LayoutElementDelegate } from '../../types';

export default class UnitLayout implements LayoutElement<Text> {
  backingInstance: LayoutElement<Text>;

  node: Text;
  parent: LayoutElement<*> | LayoutElementDelegate<*>;
  children = Object.freeze([]);
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
  isInline = true;

  constructor(node: Text, parent: LayoutElement<*>) {
    this.backingInstance = this;
    this.node = node;
    this.parent = parent;
    parent.backingInstance.children.push(this);
    this.dimensions.measuredWidth = node.body.length;
    this.dimensions.measuredHeight = 1;

    // Calculate placement
    if (this.parent.lastChild instanceof UnitLayout) {
      this.placement.x =
        this.parent.backingInstance.placement.x +
        this.parent.backingInstance.dimensions.measuredWidth;
      this.placement.y = this.parent.backingInstance.placement.y;
    } else {
      this.placement.x = this.parent.backingInstance.placement.x;
      this.placement.y =
        this.parent.backingInstance.placement.y +
        this.parent.backingInstance.dimensions.measuredHeight;
    }
    this.placement.x += this.parent.backingInstance.insetBounds.left;
    this.placement.y += this.parent.backingInstance.insetBounds.top;
  }

  getDimensions() {
    return this.dimensions;
  }

  // eslint-disable-next-line no-unused-vars
  updateDimensions(childLayout: *) {
    // NOOP
  }

  hasRenderElements() {
    return true;
  }

  getRenderElements() {
    if (shouldSkip(this.parent.backingInstance.dimensions)) {
      return [];
    }

    const { textAlign } = this.parent.backingInstance.node.styleProps || {};
    const value = trimHorizontally(
      this.parent.backingInstance.dimensions,
      this.node.body,
      textAlign
    );

    this.parent.backingInstance.dimensions.usedHeight++;
    this.parent.backingInstance.dimensions.usedWidth += value.length;

    return [
      {
        body: {
          value,
          style: makeInlineStyle(collectStyleProps(this)),
          x: this.placement.x,
          y: this.placement.y,
        },
      },
    ];
  }

  getLayoutTree() {
    const { finalWidth, finalHeight } = this.getDimensions();
    return {
      type: UnitLayout.name,
      dimensions: {
        width: finalWidth,
        height: finalHeight,
      },
      placement: this.placement,
      body: this.node.body,
    };
  }
}

function collectStyleProps(layout: LayoutElement<*>) {
  const styleProps = [];
  let currentLayout = layout.backingInstance.parent;
  while (currentLayout && currentLayout.backingInstance.node) {
    if (currentLayout.backingInstance.node.styleProps) {
      const {
        backgroundColor,
        ...inlineStyleProps
      } = currentLayout.backingInstance.node.styleProps;
      styleProps.push(inlineStyleProps);
    }
    currentLayout = currentLayout.backingInstance.parent || null;
  }
  return styleProps.reverse();
}
