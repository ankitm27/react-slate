/* @flow */

import type Dimensions from './Dimensions2';

/**
 * Trim value's length and optionally align the value.
 */
export default function trimHorizontally(
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
