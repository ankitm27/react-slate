/* @flow */

import Dimensions from '../lib/Dimensions';
import Placement from '../lib/Placement';
import type Text from '../../nodes/Text';
import trimHorizontally from '../lib/trimHorizontally';
import { makeInlineStyle } from '../lib/makeStyle';
import type { LayoutElement, LayoutElementDelegate } from '../../types';

export default class UnitLayout implements LayoutElement<Text> {
  backingInstance: LayoutElement<Text>;

  node: Text;
  parent: LayoutElement<*> | LayoutElementDelegate<*>;
  children = Object.freeze([]);
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
  isInline = true;
  isAbsolute = false;

  constructor(node: Text, parent: LayoutElement<*>) {
    this.backingInstance = this;
    this.node = node;
    this.parent = parent;
    parent.backingInstance.children.push(this);

    this.dimensions.calculateFromText(node.body);
    this.placement.initForUnitLayout({
      wasLastChildUnitLayout:
        this.parent.backingInstance.lastChild instanceof UnitLayout,
      parentDimensions: this.parent.backingInstance.dimensions,
      parentPlacement: this.parent.backingInstance.placement,
      parentInsetBounds: this.parent.backingInstance.insetBounds,
    });
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
    if (!this.parent.backingInstance.getDimensions().hasAvailableSpace()) {
      return [];
    }

    const { textAlign } = this.parent.backingInstance.node.styleProps || {};
    const value = trimHorizontally(
      this.parent.backingInstance.getDimensions(),
      this.node.body,
      textAlign
    );
    this.parent.backingInstance.getDimensions().updateStateFromText(value);

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
      placement: this.placement.valueOf(),
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
