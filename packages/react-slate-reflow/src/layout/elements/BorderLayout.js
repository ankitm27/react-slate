/* @flow */

import ContainerLayout from './ContainerLayout';
import { makeBorderStyle, makeBlockStyle } from '../lib/makeStyle';
import type View from '../../nodes/View';
import type { LayoutElement, LayoutElementDelegate } from '../../types';

const BORDER_CHARS = {
  'single-line': {
    top: '─',
    bottom: '─',
    left: '│',
    right: '│',
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
  },
  'double-line': {
    top: '═',
    bottom: '═',
    left: '║',
    right: '║',
    topLeft: '╔',
    topRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝',
  },
};

export default class BorderLayout implements LayoutElementDelegate<View> {
  backingInstance: LayoutElement<View>;

  constructor(node: View, parent: LayoutElement<*>) {
    this.backingInstance = new ContainerLayout(node, parent);
    parent.children[parent.children.length - 1] = this; // eslint-disable-line no-param-reassign
    // Children layout must have offset of (1, 1), otherwise it would overlap with border.
    this.backingInstance.placement.x += 1;
    this.backingInstance.placement.y += 1;
  }

  getDimensions() {
    const dimensions = this.backingInstance.getDimensions().copy();
    const getSize = dimensions.getSize;
    dimensions.getSize = insetBounds => {
      const originalSize = getSize.call(dimensions, insetBounds);
      return {
        width: originalSize.width + 2,
        height: originalSize.height + 2,
      };
    };
    return dimensions;
  }

  updateDimensions(childLayout: *) {
    this.backingInstance.updateDimensions(childLayout);
  }

  hasRenderElements() {
    return true;
  }

  getRenderElements() {
    const { width, height } = this.backingInstance
      .getDimensions()
      .getSize(this.backingInstance.insetBounds);
    const x = this.backingInstance.placement.x - 1;
    const y = this.backingInstance.placement.y - 1;
    const elementsFromBackingLayout = this.backingInstance.hasRenderElements()
      ? this.backingInstance.getRenderElements()
      : [];
    const style = makeBorderStyle(
      this.backingInstance.node.borderProps,
      this.backingInstance.node.styleProps
    );
    const borderChars =
      // $FlowFixMe
      BORDER_CHARS[this.backingInstance.node.borderProps.thickness];
    return [
      ...new Array(height).fill(null).map((e, index) => ({
        body: {
          value: ' '.repeat(width),
          x: x + 1,
          y: y + index + 1,
          style: makeBlockStyle(this.backingInstance.node.styleProps),
        },
      })),
      ...elementsFromBackingLayout,
      {
        body: {
          value: `${borderChars.topLeft}${borderChars.top.repeat(width)}${
            borderChars.topRight
          }`,
          x,
          y,
          style,
        },
      },
      ...new Array(height).fill(null).map((e, index) => ({
        body: {
          value: borderChars.left,
          x,
          y: y + index + 1,
          style,
        },
      })),
      ...new Array(height).fill(null).map((e, index) => ({
        body: {
          value: borderChars.right,
          x: x + width + 1,
          y: y + index + 1,
          style,
        },
      })),
      {
        body: {
          value: `${borderChars.bottomLeft}${borderChars.bottom.repeat(width)}${
            borderChars.bottomRight
          }`,
          x,
          y: y + height + 1,
          style,
        },
      },
    ];
  }

  getLayoutTree() {
    const { width, height } = this.getDimensions().getSize(
      this.backingInstance.insetBounds
    );
    return {
      ...this.backingInstance.getLayoutTree(),
      placement: {
        x: this.backingInstance.placement.x - 1,
        y: this.backingInstance.placement.y - 1,
        z: this.backingInstance.placement.z,
      },
      dimensions: {
        width,
        height,
      },
      type: `${BorderLayout.name}${
        this.backingInstance.isInline ? '(inline)' : ''
      }`,
    };
  }
}
