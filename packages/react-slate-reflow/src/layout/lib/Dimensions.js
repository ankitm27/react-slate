/* @flow */

import type { Bounds, Size, PlacementValue } from '../../types';

function withBounds({ width, height }: Size, ...bounds: Bounds[]) {
  return {
    width: bounds.reduce((acc, { left, right }) => acc + left + right, width),
    height: bounds.reduce((acc, { top, bottom }) => acc + top + bottom, height),
  };
}

function getValue(...values: number[]) {
  const result = values.find(value => value > -1);
  return typeof result === 'undefined' ? -1 : result;
}

function getMinValue(...values: number[]) {
  return Math.min(...values.filter(value => value > -1));
}

const TEXT_HEIGHT = 1;

export default class Dimensions {
  width = {
    measured: 0,
    max: -1,
    fixed: -1,
  };
  height = {
    measured: 0,
    max: -1,
    fixed: -1,
  };

  copy() {
    const dimensions = new Dimensions();
    dimensions.width = {
      ...this.width,
    };
    dimensions.height = {
      ...this.height,
    };
    return dimensions;
  }

  getAvailableWidth() {
    return getValue(this.width.fixed, this.width.max);
  }

  hasAvailableSpace() {
    return getValue(this.height.fixed, this.height.max) !== 0;
  }

  setMaxDimensions({
    isAbsolute,
    isInline,
    isSwitching,
    insetBounds,
    parentDimensions,
  }: {
    isAbsolute: boolean,
    isInline: boolean,
    isSwitching: boolean,
    insetBounds: Bounds,
    parentDimensions: Dimensions,
  }) {
    if (isAbsolute) {
      return;
    }

    // If parent has fixed width/height or max value is set
    // (because other parent has fixed width/height), set max value to current
    // element, subtract inset bounds and space already taken from parent
    // only if the current element is inline and it's not switching between
    // either inline -> block or block -> inline.

    if (parentDimensions.width.fixed > -1 || parentDimensions.width.max > -1) {
      this.width.max =
        getValue(parentDimensions.width.fixed, parentDimensions.width.max) -
        (insetBounds.left +
          insetBounds.right +
          (isInline && !isSwitching ? parentDimensions.width.measured : 0));
    }

    if (
      parentDimensions.height.fixed > -1 ||
      parentDimensions.height.max > -1
    ) {
      this.height.max =
        getValue(parentDimensions.height.fixed, parentDimensions.height.max) -
        (insetBounds.top + insetBounds.bottom + isInline && !isSwitching
          ? 0
          : parentDimensions.height.measured);
    }
  }

  // TODO: what about parent's bounds
  setOwnConstrains({
    getWidthConstrain,
    getHeightConstrain,
    insetBounds,
    parentDimensions,
  }: {
    getWidthConstrain: ?(number) => number,
    getHeightConstrain: ?(number) => number,
    insetBounds: Bounds,
    parentDimensions: Dimensions,
  }) {
    if (getWidthConstrain) {
      const fixedWidth = getWidthConstrain(parentDimensions.getSize().width);
      // Make sure current element won't overflow.
      this.width.fixed = getMinValue(
        fixedWidth - (insetBounds.left + insetBounds.right),
        this.width.max
      );
    }

    if (getHeightConstrain) {
      const fixedHeight = getHeightConstrain(parentDimensions.getSize().height);
      // Make sure current element won't overflow.
      this.height.fixed = getMinValue(
        fixedHeight - (insetBounds.top + insetBounds.bottom),
        this.height.max
      );
    }
  }

  getSize(...bounds: Bounds[]) {
    return withBounds(
      {
        width: getValue(this.width.fixed, this.width.measured),
        height: getValue(this.height.fixed, this.height.measured),
      },
      ...bounds
    );
  }

  calculateFromText(text: string) {
    this.width.measured = getMinValue(this.width.max, text.length);
    this.height.measured = getMinValue(this.height.max, TEXT_HEIGHT);
  }

  calculateFromElement(
    { width, height }: Size,
    childPlacementDiff: PlacementValue
  ) {
    this.width.measured = getMinValue(
      this.width.fixed,
      this.width.max,
      Math.max(this.width.measured, childPlacementDiff.x + width)
    );
    this.height.measured = getMinValue(
      this.height.fixed,
      this.height.max,
      Math.max(this.height.measured, childPlacementDiff.y + height)
    );
  }

  calculateFromAbsoluteElement({ width, height }: Size) {
    this.width.measured = Math.max(this.width.measured, width);
    this.height.measured = Math.max(this.height.measured, height);
  }
}
