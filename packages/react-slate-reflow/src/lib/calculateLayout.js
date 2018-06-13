/* @flow */

import { Stack } from 'buckets-js';
import type { LayoutElement } from '../types';
import Root from '../nodes/Root';
import Node from '../nodes/Node';
import Text from '../nodes/Text';

export default function calculateLayout(root: Root): LayoutElement[] {
  const size = root.size;
  const elements = [];
  const state = new Stack();
  const inlineState = new InlineState();

  const visit = (node: ChildNode) => {
    const parentState = state.peek();

    if (node instanceof Node) {
      inlineState.reset();

      const {
        marginTop = 0,
        marginRight = 0,
        marginBottom = 0,
        marginLeft = 0,
        paddingTop = 0,
        paddingRight = 0,
        paddingBottom = 0,
        paddingLeft = 0,
      } = normalize(node.layoutProps || {});

      const currentState = {
        style: [...parentState.style, node.styleProps],
        x: parentState.x + parentState.offsetX + marginLeft,
        y:
          parentState.y +
          parentState.offsetY +
          // If children height is 0 and inlineState was active, add height of 1
          (parentState.offsetY === 0 && inlineState.isSwitching ? 1 : 0) +
          marginTop,
        offsetX: paddingLeft,
        offsetY: paddingTop,
        width: size.width,
      };

      let persistedElement = null;
      if (shouldMakeElementFromNode(node)) {
        persistedElement = makeElementFromNodeState(currentState);
        elements.push(persistedElement);
      }

      state.push(currentState);

      let {
        childrenHeight,
        childrenOffsetY,
        childrenOffsetX,
      } = getLayoutFromChildren(
        node.children.map(child => {
          const layoutResults = visit(child);
          // Update offset, so that next child will position itself properly.
          currentState.offsetY += layoutResults.calculatedHeight;
          return layoutResults;
        })
      );

      childrenHeight += childrenHeight === 0 && inlineState.isActive ? 1 : 0;

      if (persistedElement) {
        persistedElement.box.height =
          paddingTop + childrenHeight + paddingBottom;
      }

      state.pop();
      inlineState.reset();

      return {
        calculatedHeight: paddingTop + childrenHeight + paddingBottom,
        calculatedOffsetY: childrenOffsetY + marginBottom,
        calculatedOffsetX: childrenOffsetX + marginRight,
      };
    } else if (node instanceof Text) {
      const { accumulatedXOffset, accumulatedYOffset } = inlineState.makeActive(
        node.body
      );

      elements.push(
        makeElementFromText({
          node,
          parentState,
          accumulatedXOffset,
        })
      );

      return {
        calculatedHeight: inlineState.isActive ? accumulatedYOffset : 1,
        calculatedOffsetX: 0,
        calculatedOffsetY: 0,
      };
    }

    // NOOP'ed node
    return {
      calculatedHeight: 0,
      calculatedOffsetY: 0,
      calculatedOffsetX: 0,
    };
  };

  state.push({
    style: [],
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
    width: size.width,
    refNode: null,
  });

  const results = root.children.map(visit);
  const height = results.reduce(
    (acc, { calculatedHeight, calculatedOffsetY }) =>
      acc + calculatedHeight + calculatedOffsetY,
    0
  );

  // console.log(height);

  return { elements };
}

function normalize(obj): { [key: string]: * } {
  return Object.keys(obj)
    .filter(key => typeof obj[key] !== 'undefined' || obj[key] !== null)
    .reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});
}

function shouldMakeElementFromNode(node: Node) {
  return node.styleProps && node.styleProps.backgroundColor;
}

function getLayoutFromChildren(childrenResults) {
  return childrenResults.reduce(
    (acc, { calculatedHeight, calculatedOffsetX, calculatedOffsetY }) => ({
      childrenHeight: acc.childrenHeight + calculatedHeight,
      childrenOffsetX: acc.childrenOffsetX + calculatedOffsetX,
      childrenOffsetY: acc.childrenOffsetY + calculatedOffsetY,
    }),
    { childrenHeight: 0, childrenOffsetX: 0, childrenOffsetY: 0 }
  );
}

function makeStyle(styles, blacklist = []) {
  const flatStyles = styles.reduce(
    (acc, style) => ({
      ...acc,
      ...(style &&
        blacklist.reduce((currentStyles, key) => {
          const { [key]: omit, ...rest } = currentStyles;
          return rest;
        }, style)),
    }),
    {}
  );

  return Object.keys(flatStyles).length ? flatStyles : null;
}

function makeElementFromText({ node, parentState, accumulatedXOffset }) {
  return {
    body: {
      value: node.body,
      x: parentState.x + parentState.offsetX + accumulatedXOffset,
      y: parentState.y + parentState.offsetY,
      style: makeStyle(parentState.style, ['backgroundColor']),
    },
  };
}

function makeElementFromNodeState(currentState) {
  return {
    box: {
      style: makeStyle(currentState.style),
      x: currentState.x,
      y: currentState.y,
      width: currentState.width,
      height: -1,
    },
  };
}

class InlineState {
  isActive = false;
  isSwitching = false;
  accumulatedXOffset = 0;
  accumulatedYOffset = 0;

  reset() {
    this.isSwitching = this.isActive;
    this.isActive = false;
    this.accumulatedXOffset = 0;
    this.accumulatedYOffset = 0;
  }

  makeActive(body: string) {
    this.isSwitching = this.isActive;
    this.isActive = true;
    const { accumulatedXOffset, accumulatedYOffset } = this;
    this.accumulatedXOffset += body.length;
    this.accumulatedYOffset = 0;

    return {
      accumulatedXOffset,
      accumulatedYOffset,
    };
  }
}
