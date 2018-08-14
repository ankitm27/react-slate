/* @flow */

import assign from './assign';
import type { Bounds, Dimensions, Size } from '../../types';

export function makeEmptyDimensions(): Dimensions {
  return {
    measuredWidth: 0,
    measuredHeight: 0,
    fixedWidth: -1,
    fixedHeight: -1,
    usedWidth: 0,
    usedHeight: 0,
    get finalWidth() {
      return this.fixedWidth === -1 ? this.measuredWidth : this.fixedWidth;
    },
    get finalHeight() {
      return this.fixedHeight === -1 ? this.measuredHeight : this.fixedHeight;
    },
    get availableWidth() {
      return this.fixedWidth - this.usedWidth;
    },
    get availableHeight() {
      return this.fixedHeight - this.usedHeight;
    },
  };
}

export function withBounds({ width, height }: Size, ...bounds: Bounds[]) {
  return {
    width: bounds.reduce((acc, { left, right }) => acc + left + right, width),
    height: bounds.reduce((acc, { top, bottom }) => acc + top + bottom, height),
  };
}

/**
 * Check if the element will fit, based on height constrain.
 */
export function shouldSkip(dimensions: Dimensions) {
  if (dimensions.fixedHeight === -1) {
    return false;
  }

  if (dimensions.availableHeight > 0) {
    return false;
  }

  return true;
}

/**
 * Trim value's length, increment used width and optionally align the value.
 */
export function trimHorizontally(
  dimensions: Dimensions,
  value: string,
  align?: 'left' | 'center' | 'right'
) {
  if (dimensions.fixedWidth > -1) {
    const trimmedValue = value.slice(0, dimensions.availableWidth);
    switch (align) {
      case 'left':
      default: {
        return trimmedValue;
      }
      case 'center': {
        const fillLength = dimensions.availableWidth - trimmedValue.length;
        const leftFillLength = Math.floor(fillLength / 2);
        const rightFillLength = fillLength - leftFillLength;
        const alignedValue = `${' '.repeat(
          leftFillLength
        )}${trimmedValue}${' '.repeat(rightFillLength)}`;
        return alignedValue;
      }
      case 'right': {
        const fillLength = dimensions.availableWidth - trimmedValue.length;
        const alignedValue = `${' '.repeat(fillLength)}${trimmedValue}`;
        return alignedValue;
      }
    }
  }
  return value;
}

/**
 * Set vertical or horizontal constrain using subtracted inset bounds from a fixed value.
 */
export function withConstrain(
  dimensions: Dimensions,
  dimension: 'width' | 'height',
  fixedValue: number,
  insetBounds?: Bounds
) {
  const { top = 0, left = 0, right = 0, bottom = 0 } = insetBounds || {};
  if (dimension === 'width') {
    return assign({}, dimensions, { fixedWidth: fixedValue - (left + right) });
  } else if (dimension === 'height') {
    return assign({}, dimensions, { fixedHeight: fixedValue - (top + bottom) });
  }
  throw new Error(`Invalid dimension ${dimension}`);
}
