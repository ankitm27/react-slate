/* @flow */

import BoxModel from '../lib/BoxModel';
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

  boxModel = new BoxModel();
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
      this.boxModel.setBounds({
        insetBounds,
        outsetBounds,
      });
      this.isInline = isInline && !isAbsolute;
      this.isAbsolute = isAbsolute;
      if (this.isAbsolute) {
        this.boxModel.setOutOfTreePosition(placement);
      }
    }

    const isSwitching =
      this.isInline !== isLayoutInline(this.parent.backingInstance.lastChild);

    this.boxModel.setMaxDimensions({
      parentBox: this.parent.backingInstance.getBoxModel(),
      variant: this.isInline ? 'current-line' : 'next-line',
      isSwitching,
    });

    if (getWidthConstrain) {
      this.boxModel.setWidthConstrain({
        parentBox: this.parent.backingInstance.getBoxModel(),
        value: getWidthConstrain(
          this.parent.backingInstance.getBoxModel().getSize().width
        ),
      });
    }

    if (getHeightConstrain) {
      this.boxModel.setHeightConstrain({
        parentBox: this.parent.backingInstance.getBoxModel(),
        value: getHeightConstrain(
          this.parent.backingInstance.getBoxModel().getSize().height
        ),
      });
    }

    if (this.parent.backingInstance.lastChild && !this.isAbsolute) {
      this.boxModel.setPosition({
        parentBox: this.parent.backingInstance.getBoxModel(),
        // $FlowFixMe
        siblingBox: this.parent.backingInstance.lastChild.backingInstance.getBoxModel(),
        variant: this.isInline && !isSwitching ? 'current-line' : 'next-line',
      });
    } else if (!this.isAbsolute) {
      this.boxModel.setPosition({
        parentBox: this.parent.backingInstance.getBoxModel(),
        variant: 'init',
      });
    }
  }

  getBoxModel() {
    return this.boxModel;
  }

  updateDimensions(childLayout: LayoutElement<*> | LayoutElementDelegate<*>) {
    if (childLayout.backingInstance.isAbsolute) {
      // Absolute children have no dimensions from the parent point of view
      return;
    }

    const childBox = childLayout.getBoxModel();
    if (!this.boxModel.contains({ childBox })) {
      this.boxModel.resizeToContain({ childBox });
    }

    this.lastChild = childLayout;
  }

  isDrawable() {
    return Boolean(
      this.node.styleProps && this.node.styleProps.backgroundColor
    );
  }

  getDrawableItems() {
    const { width, height } = this.boxModel.getSize();
    const { x, y } = this.boxModel.getPosition();
    return [
      // If element has `backgroundColor`, in order to prevent overlapping background
      // elements to foreground we need to create fake body elements, which will cover the area.
      ...new Array(height).fill(null).map((e, index) => ({
        body: {
          value: ' '.repeat(width),
          style: null,
          x,
          y: y + index,
        },
      })),
      {
        box: {
          style: makeBlockStyle(this.node.styleProps),
          x,
          y,
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
      dimensions: this.boxModel.getSize(),
      placement: this.boxModel.getPosition(),
      // $FlowFixMe
      children: this.children.map((child: LayoutElement<*>) =>
        child.getLayoutTree()
      ),
    };
  }
}
