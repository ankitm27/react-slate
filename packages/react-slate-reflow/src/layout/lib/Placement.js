/* @flow */

import type Dimensions from './Dimensions';
import type { Bounds } from '../../types';

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

  initUnitLayoutAsFirstChild({
    parentPlacement,
    parentInsetBounds,
  }: {
    parentPlacement: Placement,
    parentInsetBounds: Bounds,
  }) {
    this.x = parentPlacement.x + parentInsetBounds.left;
    this.y = parentPlacement.y + parentInsetBounds.top;
    this.z = parentPlacement.z;
  }

  initUnitLayoutAsNextChild({
    isPreviousChildInline,
    previousChildDimensions,
    previousChildPlacement,
    previousChildOutsetBounds,
    previousChildInsetBounds,
    parentPlacement,
    parentInsetBounds,
  }: {
    isPreviousChildInline: boolean,
    previousChildDimensions: Dimensions,
    previousChildPlacement: Placement,
    previousChildOutsetBounds: Bounds,
    previousChildInsetBounds: Bounds,
    parentPlacement: Placement,
    parentInsetBounds: Bounds,
  }) {
    this.z = parentPlacement.z;
    const { width, height } = previousChildDimensions.getSize(
      previousChildInsetBounds
    );
    if (isPreviousChildInline) {
      this.x =
        previousChildPlacement.x + width + previousChildOutsetBounds.right;
      this.y = previousChildPlacement.y;
    } else {
      this.x = parentPlacement.x + parentInsetBounds.left;
      this.y =
        // Previous child's placement will have left outset bound already in it, so
        // we only need to add a bottom one.
        previousChildPlacement.y + height + previousChildOutsetBounds.bottom;
    }
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
        parentDimensions.height.measured +
        outsetBounds.top;
      this.z = parentPlacement.z;
    } else if (!isAbsolute) {
      // Inline placement
      this.x =
        parentPlacement.x +
        parentInsetBounds.left +
        parentDimensions.width.measured +
        outsetBounds.left;
      this.y = parentPlacement.y + parentInsetBounds.top + outsetBounds.top;
      this.z = parentPlacement.z;
    }
  }

  getChildPlacementDiff(childPlacement: Placement, insetBounds: Bounds) {
    // NOTE: left and top inset bounds have to be subtracted, since
    // they were added in child's placement.
    return {
      x: childPlacement.x - this.x - insetBounds.left,
      y: childPlacement.y - this.y - insetBounds.top,
      z: this.z,
    };
  }
}
