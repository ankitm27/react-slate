/* @flow */

import type { Dimensions as DimensionsValue } from '../types';

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

  /**
   * TODO: add docs
   */
  setConstrain(dimension: 'width' | 'height', fixedValue: number) {
    if (dimension === 'width') {
      this.constrains.forWidth = true;
      this.fixedWidth = fixedValue;
    } else if (dimension === 'height') {
      this.constrains.forHeight = true;
      this.fixedHeight = fixedValue;
    } else {
      throw new Error(`Invalid dimension ${dimension}`);
    }
  }

  /**
   * TODO: add docs
   */
  trimHorizontally(value: string) {
    if (this.constrains.forWidth) {
      const trimmedValue = value.slice(0, this.fixedWidth - this.usedWidth);
      this.usedWidth += trimmedValue.length;
      return trimmedValue;
    }
    return value;
  }

  /**
   * TODO: add docs
   */
  shouldSkip() {
    if (!this.constrains.forHeight) {
      return false;
    }

    const { usedHeight, fixedHeight } = this;
    if (fixedHeight - usedHeight > 0) {
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
