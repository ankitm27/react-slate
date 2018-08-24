/* @flow */

import ContainerLayout from './ContainerLayout';
import { withBounds } from '../lib/dimensions';
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
    const {
      measuredWidth,
      measuredHeight,
      fixedWidth,
      fixedHeight,
      usedWidth,
      usedHeight,
      finalWidth,
      finalHeight,
      availableWidth,
      availableHeight,
    } = this.backingInstance.getDimensions();
    return {
      measuredWidth: measuredWidth + 2,
      measuredHeight: measuredHeight + 2,
      fixedWidth: fixedWidth + 2,
      fixedHeight: fixedHeight + 2,
      usedWidth: usedWidth + 2,
      usedHeight: usedHeight + 2,
      finalWidth: finalWidth + 2,
      finalHeight: finalHeight + 2,
      availableWidth: availableWidth + 2,
      availableHeight: availableHeight + 2,
    };
  }

  updateDimensions(childLayout: *) {
    this.backingInstance.updateDimensions(childLayout);
  }

  hasRenderElements() {
    return true;
  }

  getRenderElements() {
    const { finalHeight, finalWidth } = this.backingInstance.getDimensions();
    const { width, height } = withBounds(
      { width: finalWidth, height: finalHeight },
      this.backingInstance.insetBounds
    );
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
    const { finalHeight, finalWidth } = this.getDimensions();
    const { width, height } = withBounds(
      { width: finalWidth, height: finalHeight },
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
