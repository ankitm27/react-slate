/* @flow */

import type { Dimensions as DimensionsValue, Bounds } from '../types';

export default class Dimensions {
  width = 0;
  height = 0;
  fixedHeight = 0;
  fixedWidth = 0;
  usedWidth = 0;
  usedHeight = 0;
  constrains = {
    forWidth: false,
    forHeight: false,
  };

  get finalWidth() {
    return this.constrains.forWidth ? this.fixedWidth : this.width;
  }

  get finalHeight() {
    return this.constrains.forHeight ? this.fixedHeight : this.height;
  }

  get availableWidth() {
    return this.fixedWidth - this.usedWidth;
  }

  get availableHeight() {
    return this.fixedHeight - this.usedHeight;
  }

  /**
   * Set vertical or horizontal constrain using subtracted inset bounds from a fixed value.
   */
  setConstrain(
    dimension: 'width' | 'height',
    fixedValue: number,
    insetBounds?: Bounds
  ) {
    const { top = 0, left = 0, right = 0, bottom = 0 } = insetBounds || {};
    if (dimension === 'width') {
      this.constrains.forWidth = true;
      this.fixedWidth = fixedValue - (left + right);
    } else if (dimension === 'height') {
      this.constrains.forHeight = true;
      this.fixedHeight = fixedValue - (top + bottom);
    } else {
      throw new Error(`Invalid dimension ${dimension}`);
    }
  }

  /**
   * Trim value's length and increment used width.
   */
  trimHorizontally(value: string) {
    if (this.constrains.forWidth) {
      const trimmedValue = value.slice(0, this.availableWidth);
      this.usedWidth += trimmedValue.length;
      return trimmedValue;
    }
    return value;
  }

  /**
   * Check if the element will fit, based on height constrain.
   */
  shouldSkip() {
    if (!this.constrains.forHeight) {
      return false;
    }

    if (this.availableHeight > 0) {
      this.usedHeight++;
      return false;
    }

    return true;
  }

  valueOf(): DimensionsValue {
    return {
      width: this.finalWidth,
      height: this.finalHeight,
    };
  }
}
