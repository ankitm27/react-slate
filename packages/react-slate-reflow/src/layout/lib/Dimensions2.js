/* @flow */

import type { Bounds, Size } from '../../types';

function withBounds({ width, height }: Size, ...bounds: Bounds[]) {
  return {
    width: bounds.reduce((acc, { left, right }) => acc + left + right, width),
    height: bounds.reduce((acc, { top, bottom }) => acc + top + bottom, height),
  };
}

export default class Dimensions {
  measuredWidth = 0;
  measuredHeight = 0;
  fixedWidth = -1;
  fixedHeight = -1;
  usedWidth = 0;
  usedHeight = 0;

  get finalWidth() {
    return this.fixedWidth === -1 ? this.measuredWidth : this.fixedWidth;
  }
  get finalHeight() {
    return this.fixedHeight === -1 ? this.measuredHeight : this.fixedHeight;
  }
  get availableWidth() {
    return this.fixedWidth - this.usedWidth;
  }
  get availableHeight() {
    return this.fixedHeight - this.usedHeight;
  }

  setConstrain(
    dimension: 'width' | 'height',
    fixedValue: number,
    insetBounds?: Bounds
  ) {
    const { top = 0, left = 0, right = 0, bottom = 0 } = insetBounds || {};
    if (dimension === 'width') {
      this.fixedWidth = fixedValue - (left + right);
    } else if (dimension === 'height') {
      this.fixedHeight = fixedValue - (top + bottom);
    } else {
      throw new Error(`Invalid dimension ${dimension}`);
    }
  }

  // Set constrains from parent to propagate them down unless it's positioned absolutely
  setMaxDimensions({
    isAbsolute,
    insetBounds,
    parentDimensions,
  }: {
    isAbsolute: boolean,
    insetBounds: Bounds,
    parentDimensions: Dimensions,
  }) {
    if (isAbsolute) {
      return;
    }

    if (parentDimensions.fixedWidth > -1) {
      this.setConstrain('width', parentDimensions.fixedWidth, insetBounds);
    }

    if (parentDimensions.fixedHeight > -1) {
      this.setConstrain(
        'height',
        parentDimensions.availableHeight,
        insetBounds
      );
    }
  }

  // TODO: what parent about bounds
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
      const fixedWidth = getWidthConstrain(parentDimensions.finalWidth);
      // Make sure current element won't overflow. Only apply
      // own fixed width if parent either doesn't have any
      // constrain or parent's fixed width is grater/equal own
      // fixed width.
      if (
        parentDimensions.fixedWidth === -1 ||
        parentDimensions.fixedWidth >= fixedWidth
      ) {
        this.setConstrain('width', fixedWidth, insetBounds);
      }
    }
    if (getHeightConstrain) {
      const fixedHeight = getHeightConstrain(parentDimensions.finalHeight);
      // Make sure current element won't overflow. Only apply
      // own fixed height if parent either doesn't have any
      // constrain or parent's fixed height is grater/equal own
      // fixed height.
      if (
        parentDimensions.fixedHeight === -1 ||
        parentDimensions.fixedHeight >= fixedHeight
      ) {
        this.setConstrain('height', fixedHeight, insetBounds);
      }
    }
  }

  getSize(...bounds: Bounds[]) {
    return withBounds(
      {
        width: this.finalWidth,
        height: this.finalHeight,
      },
      ...bounds
    );
  }

  calculateFromText(text: string) {
    this.measuredHeight = 1;
    this.measuredWidth = text.length;
  }

  calculateInitialDimensions({ width, height }: Size) {
    this.measuredWidth = width;
    this.measuredHeight = height;
  }

  calculateFromBlockElement({ width, height }: Size) {
    this.measuredWidth = Math.max(this.measuredWidth, width);
    this.measuredHeight += height;
  }

  calculateFromInlineElement({ width, height }: Size) {
    this.measuredWidth += width;
    this.measuredHeight = Math.max(this.measuredHeight, height);
  }

  calculateFromAbsoluteElement({ width, height }: Size) {
    this.measuredWidth = Math.max(this.measuredWidth, width);
    this.measuredHeight = Math.max(this.measuredHeight, height);
  }

  resetState({
    isInline,
    isAbsolute,
    parentDimensions,
  }: {
    isInline: boolean,
    isAbsolute: boolean,
    parentDimensions: Dimensions,
  }) {
    if (isInline && parentDimensions.fixedWidth > -1) {
      // If current container element is inline, usedWidth must be copied from
      // parent element.
      this.usedWidth = parentDimensions.usedWidth;
    } else if (!isAbsolute && parentDimensions.fixedWidth > -1) {
      // Reset usedWidth if current element is not inline, since it will
      // push content to the next line.
      parentDimensions.usedWidth = 0; // eslint-disable-line no-param-reassign
    }
  }

  updateStateFromText(text: string) {
    this.usedHeight++;
    this.usedWidth += text.length;
  }

  updateStateFromElement({ height }: { height: number }) {
    this.usedHeight += height;
  }

  hasAvailableSpace() {
    return this.fixedHeight === -1 || this.availableHeight > 0;
  }
}
