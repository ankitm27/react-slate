/* @flow */

import { Stack } from 'buckets-js';
import assert from 'assert';
import Root from '../nodes/Root';
import View from '../nodes/View';
import Text from '../nodes/Text';
import RootLayout from './elements/RootLayout';
import ContainerLayout from './elements/ContainerLayout';
import BorderLayout from './elements/BorderLayout';
import UnitLayout from './elements/UnitLayout';
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

    if (node instanceof View) {
      const currentLayout = node.borderProps
        ? new BorderLayout(node, parentLayout)
        : new ContainerLayout(node, parentLayout);

      let boxRenderElementIndex = -1;
      if (currentLayout.hasRenderElements()) {
        // $FlowFixMe
        renderElements.push(null);
        boxRenderElementIndex = renderElements.length - 1;
      }

      layoutState.push(currentLayout);

      node.children.forEach(child => {
        const childLayout = visit(child);
        currentLayout.updateDimensions(childLayout);
      });

      layoutState.pop();

      if (boxRenderElementIndex > -1) {
        renderElements.splice(
          boxRenderElementIndex,
          1,
          ...currentLayout.getRenderElements()
        );
      }

      return currentLayout;
    } else if (node instanceof Text) {
      const currentLayout = new UnitLayout(node, parentLayout);
      renderElements.push(...currentLayout.getRenderElements());
      return currentLayout;
    }

    throw new Error('Unsupported node');
  };

  // Initial block layout element for Root.
  const rootLayout = new RootLayout();
  layoutState.push(rootLayout);

  root.children.forEach(child => {
    rootLayout.updateDimensions(visit(child));
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
