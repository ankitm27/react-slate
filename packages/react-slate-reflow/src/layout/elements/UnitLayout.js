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

    this.dimensions.setMaxDimensions({
      isAbsolute: false,
      isInline: true,
      insetBounds: this.insetBounds,
      isSwitching: Boolean(
        this.parent.backingInstance.lastChild &&
          !this.parent.backingInstance.lastChild.backingInstance.isInline
      ),
      parentDimensions: this.parent.backingInstance.getDimensions(),
    });
    this.dimensions.calculateFromText(node.body);

    if (this.parent.backingInstance.lastChild) {
      const lastChildBackingInstance = this.parent.backingInstance.lastChild
        .backingInstance;
      this.placement.initUnitLayoutAsNextChild({
        isPreviousChildInline: lastChildBackingInstance.isInline,
        previousChildDimensions: this.parent.backingInstance.lastChild.getDimensions(),
        previousChildPlacement: lastChildBackingInstance.placement,
        previousChildOutsetBounds: lastChildBackingInstance.outsetBounds,

        previousChildInsetBounds: lastChildBackingInstance.insetBounds,
        parentPlacement: this.parent.backingInstance.placement,
        parentInsetBounds: this.parent.backingInstance.insetBounds,
      });
    } else {
      this.placement.initUnitLayoutAsFirstChild({
        parentPlacement: this.parent.backingInstance.placement,
        parentInsetBounds: this.parent.backingInstance.insetBounds,
      });
    }
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
    if (!this.getDimensions().hasAvailableSpace()) {
      return [];
    }

    const style = makeInlineStyle(collectStyleProps(this));
    const value = trimHorizontally(
      this.getDimensions(),
      this.node.body,
      (style && style.textAlign) || 'left'
    );

    return [
      {
        body: {
          value,
          style,
          x: this.placement.x,
          y: this.placement.y,
        },
      },
    ];
  }

  getLayoutTree() {
    return {
      type: UnitLayout.name,
      dimensions: this.getDimensions().getSize(),
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
