/* @flow */

import BoxModel from '../lib/BoxModel';
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

  boxModel = new BoxModel();
  isInline = true;
  isAbsolute = false;

  constructor(node: Text, parent: LayoutElement<*>) {
    this.backingInstance = this;
    this.node = node;
    this.parent = parent;
    parent.backingInstance.children.push(this);

    const isSwitching = Boolean(
      this.parent.backingInstance.lastChild &&
        !this.parent.backingInstance.lastChild.backingInstance.isInline
    );

    this.boxModel.setMaxDimensions({
      parentBox: this.parent.backingInstance.getBoxModel(),
      variant: 'current-line',
      isSwitching,
    });

    this.boxModel.resize({
      width: node.body.length,
      height: 1,
    });

    if (this.parent.backingInstance.lastChild) {
      this.boxModel.setPosition({
        parentBox: this.parent.backingInstance.getBoxModel(),
        // $FlowFixMe
        siblingBox: this.parent.backingInstance.lastChild.backingInstance.getBoxModel(),
        variant: isSwitching ? 'next-line' : 'current-line',
      });
    } else {
      this.boxModel.setPosition({
        parentBox: this.parent.backingInstance.getBoxModel(),
        variant: 'init',
      });
    }
  }

  getBoxModel() {
    return this.boxModel;
  }

  // eslint-disable-next-line no-unused-vars
  updateDimensions(childLayout: *) {
    // NOOP
  }

  isDrawable() {
    return true;
  }

  getDrawableItems() {
    if (!this.boxModel.hasAvailableSpace()) {
      return [];
    }

    const style = makeInlineStyle(collectStyleProps(this));
    const value = trimHorizontally(
      this.boxModel.getAvailableWidth(),
      this.node.body,
      (style && style.textAlign) || 'left'
    );

    return [
      {
        body: {
          value,
          style,
          x: this.boxModel.getPosition().x,
          y: this.boxModel.getPosition().y,
        },
      },
    ];
  }

  getLayoutTree() {
    return {
      type: UnitLayout.name,
      dimensions: this.boxModel.getSize(),
      placement: this.boxModel.getPosition(),
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
