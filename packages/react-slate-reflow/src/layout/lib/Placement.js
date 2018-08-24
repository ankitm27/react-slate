/* @flow */

import type { Bounds, Dimensions } from '../../types';

type UnitLayoutInitArgs = {
  wasLastChildUnitLayout: boolean,
  parentPlacement: Placement,
  parentDimensions: Dimensions,
  parentInsetBounds: Bounds,
};

type ContainerLayoutInitArgs = {
  isAbsolute: boolean,
  isInline: boolean,
  isPreviousLayoutInline: boolean,
  outsetBounds: Bounds,
  parentPlacement: Placement,
  parentDimensions: Dimensions,
  parentInsetBounds: Bounds,
};

export default class Placement {
  x = 0;
  y = 0;
  z = 0;

  // constructor() {}

  valueOf() {
    const { x, y, z } = this;
    return {
      x,
      y,
      z,
    };
  }

  initForUnitLayout({
    wasLastChildUnitLayout,
    parentPlacement,
    parentDimensions,
    parentInsetBounds,
  }: UnitLayoutInitArgs) {
    if (wasLastChildUnitLayout) {
      this.x = parentPlacement.x + parentDimensions.measuredWidth;
      this.y = parentPlacement.y;
    } else {
      this.x = parentPlacement.x;
      this.y = parentPlacement.y + parentDimensions.measuredHeight;
    }
    this.x += parentInsetBounds.left;
    this.y += parentInsetBounds.top;
    this.z = parentPlacement.z;
  }

  initForContainerLayout({
    isAbsolute,
    isInline,
    isPreviousLayoutInline,
    outsetBounds,
    parentPlacement,
    parentDimensions,
    parentInsetBounds,
  }: ContainerLayoutInitArgs) {
    if (!isAbsolute && (!isInline || !isPreviousLayoutInline)) {
      // Block placement
      this.x = parentPlacement.x + parentInsetBounds.left + outsetBounds.left;
      this.y =
        parentPlacement.y +
        parentInsetBounds.top +
        parentDimensions.measuredHeight +
        outsetBounds.top;
      this.z = parentPlacement.z;
    } else if (!isAbsolute) {
      // Inline placement
      this.x =
        parentPlacement.x +
        parentInsetBounds.left +
        parentDimensions.measuredWidth +
        outsetBounds.left;
      this.y = parentPlacement.y + parentInsetBounds.top + outsetBounds.top;
      this.z = parentPlacement.z;
    }
  }
}
