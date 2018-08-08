/* @flow */

import { Stack } from 'buckets-js';
import assert from 'assert';
import Root from '../nodes/Root';
import Node from '../nodes/Node';
import Text from '../nodes/Text';
import RootLayout from './builders/RootLayout';
import ContainerLayout from './builders/ContainerLayout';
import UnitLayout from './builders/UnitLayout';

import type { RenderElement } from '../types';

export default function calculateLayout(
  root: Root
): { renderElements: RenderElement[], layoutTree: RootLayout } {
  // const size = root.size;
  const renderElements = [];
  const layoutState = new Stack();

  const visit = node => {
    const parentLayout = layoutState.peek();

    assert(node !== parentLayout.node, 'Cannot use the same node as a child');

    if (node instanceof Node) {
      const currentLayout = new ContainerLayout(node, parentLayout);
      currentLayout.calculatePlacement();

      let boxRenderElementIndex = -1;
      if (currentLayout.shouldMakeRenderElement()) {
        // $FlowFixMe
        renderElements.push(null);
        boxRenderElementIndex = renderElements.length - 1;
      }

      layoutState.push(currentLayout);

      node.children.forEach(child => {
        const childLayout = visit(child);
        currentLayout.calculateDimensions(childLayout);
      });

      layoutState.pop();

      if (boxRenderElementIndex > -1) {
        renderElements[
          boxRenderElementIndex
        ] = currentLayout.makeRenderElement();
      }

      return currentLayout;
    } else if (node instanceof Text) {
      const currentLayout = new UnitLayout(node, parentLayout);
      currentLayout.calculatePlacement();
      renderElements.push(currentLayout.makeRenderElement());
      return currentLayout;
    }

    throw new Error('Unsupported node');
  };

  // Initial block layout element for Root.
  const rootLayout = new RootLayout();
  layoutState.push(rootLayout);

  root.children.forEach(child => {
    rootLayout.calculateDimensions(visit(child));
  });

  return {
    renderElements: renderElements.filter(
      // Remove body elements with empty value.
      element =>
        element && element.body ? element.body.value.length : Boolean(element)
    ),
    layoutTree: rootLayout,
  };
}
