/* @flow */

import type { LayoutProps, Bounds, LayoutElement } from '../../types';

type GetConstrain = (LayoutElement<*>, number) => number;
type NormalizedLayoutProps = {
  insetBounds: Bounds,
  outsetBounds: Bounds,
  isInline: boolean,
  getWidthConstrain: ?GetConstrain,
  getHeightConstrain: ?GetConstrain,
};

export default function normalizeLayoutProps(
  layoutProps: LayoutProps
): NormalizedLayoutProps {
  return {
    insetBounds: {
      top: Math.max(layoutProps.paddingTop || 0, 0),
      right: Math.max(layoutProps.paddingRight || 0, 0),
      bottom: Math.max(layoutProps.paddingBottom || 0, 0),
      left: Math.max(layoutProps.paddingLeft || 0, 0),
    },
    outsetBounds: {
      top: Math.max(layoutProps.marginTop || 0, 0),
      right: Math.max(layoutProps.marginRight || 0, 0),
      bottom: Math.max(layoutProps.marginBottom || 0, 0),
      left: Math.max(layoutProps.marginLeft || 0, 0),
    },
    isInline: layoutProps.display === 'inline',
    getWidthConstrain: layoutProps.width
      ? makeConstrainFactory(layoutProps.width)
      : null,
    getHeightConstrain: layoutProps.height
      ? makeConstrainFactory(layoutProps.height)
      : null,
  };
}

function makeConstrainFactory(value: number | string) {
  return (currentLayout: LayoutElement<*>, measuredDimension: number) => {
    if (value === 'auto' || (typeof value === 'number' && value < 0)) {
      return measuredDimension;
    }

    if (typeof value === 'number') {
      return value;
    }

    if (/^\d+$/.test(value)) {
      return parseInt(value, 10);
    }

    if (/^\d+%$/.test(value)) {
      if (
        currentLayout.parent.node &&
        currentLayout.parent.node.layoutProps &&
        currentLayout.parent.node.layoutProps.width === 'auto'
      ) {
        throw new Error(
          'Cannot use percentage for width/height, if parent element has width/height set to `auto`'
        );
      }

      const parentWidth =
        currentLayout.parent.backingInstance.dimensions.measuredWidth;
      const percentage = parseInt(/^(\d+)%$/.exec(value)[1], 10);

      return Math.floor(percentage / 100 * parentWidth);
    }

    return measuredDimension;
  };
}
