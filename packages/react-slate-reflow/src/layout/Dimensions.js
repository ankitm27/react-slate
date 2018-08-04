/* @flow */

import type { Dimensions as DimensionsValue } from '../types';

export default class Dimensions {
  width = 0;
  height = 0;
  fixedHeight = 0;
  fixedWidth = 0;
  usedWidth = 0;
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

  trimHorizontally(value: string) {
    if (this.constrains.forWidth) {
      const trimmedValue = value.slice(0, this.fixedWidth - this.usedWidth);
      this.usedWidth += trimmedValue.length;
      return trimmedValue;
    }
    return value;
  }

  valueOf(): DimensionsValue {
    return {
      width: this.constrains.forWidth ? this.fixedWidth : this.width,
      height: this.constrains.forHeight ? this.fixedHeight : this.height,
    };
  }
}
