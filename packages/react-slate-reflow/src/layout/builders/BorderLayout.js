/* @flow */

import RootLayout from './RootLayout';
import ContainerLayout from './ContainerLayout';
import { makeBorderStyle } from '../makeStyle';
import type View from '../../nodes/View';
import type { ContainerLayoutBuilder, UnitLayoutBuilder } from '../../types';

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

export default class BorderLayout implements ContainerLayoutBuilder {
  backingLayout: ContainerLayout;

  get parentLayout() {
    return this.backingLayout.parentLayout;
  }
  get node() {
    return this.backingLayout.node;
  }
  get children() {
    return this.backingLayout.children;
  }
  get placement() {
    return this.backingLayout.placement;
  }
  get dimensions() {
    return this.backingLayout.dimensions;
  }
  get insetBounds() {
    return this.backingLayout.insetBounds;
  }
  get outsetBounds() {
    return this.backingLayout.outsetBounds;
  }
  get lastChildLayout() {
    return this.backingLayout.lastChildLayout;
  }
  get isInline() {
    return this.backingLayout.isInline;
  }

  constructor(node: View, parentLayout: ContainerLayout | RootLayout) {
    this.backingLayout = new ContainerLayout(node, parentLayout);
    this.parentLayout.children[this.parentLayout.children.length - 1] = this;
  }

  calculatePlacement() {
    this.backingLayout.calculatePlacement();
    // Children layout must have offset of (1, 1), otherwise it would overlap with border.
    this.backingLayout.placement.x += 1;
    this.backingLayout.placement.y += 1;
  }

  getDimensionsWithBounds() {
    const { width, height } = this.backingLayout.getDimensionsWithBounds();
    return {
      width: width + 2,
      height: height + 2,
    };
  }

  getOwnDimensions() {
    const { width, height } = this.backingLayout.getOwnDimensions();
    return {
      width: width + 2,
      height: height + 2,
    };
  }

  calculateDimensions(childLayout: ContainerLayoutBuilder | UnitLayoutBuilder) {
    this.backingLayout.calculateDimensions(childLayout);
  }

  shouldMakeRenderElements() {
    return true;
  }

  makeRenderElements() {
    const { width, height } = this.backingLayout.getOwnDimensions();
    const x = this.backingLayout.placement.x - 1;
    const y = this.backingLayout.placement.y - 1;
    const elementsFromBackingLayout = this.backingLayout.shouldMakeRenderElements()
      ? this.backingLayout.makeRenderElements()
      : [];
    const style = makeBorderStyle(
      this.backingLayout.node.borderProps,
      this.backingLayout.node.styleProps
    );
    const borderChars =
      // $FlowFixMe
      BORDER_CHARS[this.backingLayout.node.borderProps.thickness];
    return [
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

  getJsonTree() {
    return {
      ...this.backingLayout.getJsonTree(),
      placement: {
        x: this.backingLayout.placement.x - 1,
        y: this.backingLayout.placement.y - 1,
      },
      dimensions: this.getOwnDimensions(),
      type: `${BorderLayout.name}${this.isInline ? '(inline)' : ''}`,
    };
  }
}
