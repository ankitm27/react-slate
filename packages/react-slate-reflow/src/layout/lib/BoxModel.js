/* @flow */

import type { Bounds, PlacementValue, Size } from '../../types';

type Position = PlacementValue;

// Model for holding bounds, dimensions and position aka placement.
// Is a representation of box model using in layout and rendering engines.

type Variant = 'init' | 'current-line' | 'next-line';
export default class BoxModel {
  _insetBounds: Bounds = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  _outsetBounds: Bounds = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  _position: Position = {
    x: 0,
    y: 0,
    z: 0,
  };
  _dimensions = {
    width: {
      measured: 0,
      max: -1,
      fixed: -1,
    },
    height: {
      measured: 0,
      max: -1,
      fixed: -1,
    },
  };

  setBounds({
    insetBounds,
    outsetBounds,
  }: {
    insetBounds?: Bounds,
    outsetBounds?: Bounds,
  }) {
    if (insetBounds) {
      this._insetBounds = insetBounds;
    }
    if (outsetBounds) {
      this._outsetBounds = outsetBounds;
    }
  }

  setPosition({
    parentBox,
    siblingBox,
    variant,
  }: {
    parentBox: BoxModel,
    siblingBox?: BoxModel,
    variant: Variant,
  }) {
    this._position.z = parentBox._position.z;
    if (variant === 'init') {
      this._position.x =
        parentBox._position.x +
        parentBox._insetBounds.left +
        this._outsetBounds.left;
      this._position.y =
        parentBox._position.y +
        parentBox._insetBounds.top +
        this._outsetBounds.top;
    } else if (variant === 'next-line') {
      if (!siblingBox) {
        throw new Error("Sibling's box must be provided");
      }
      this._position.x =
        parentBox._position.x +
        parentBox._insetBounds.left +
        this._outsetBounds.left;
      this._position.y =
        siblingBox._position.y +
        siblingBox.getSize().height +
        siblingBox._outsetBounds.bottom +
        this._outsetBounds.top;
    } else if (variant === 'current-line') {
      if (!siblingBox) {
        throw new Error("Sibling's box must be provided");
      }
      this._position.x =
        siblingBox._position.x +
        siblingBox.getSize().width +
        siblingBox._outsetBounds.right +
        this._outsetBounds.left;
      this._position.y =
        parentBox._position.y +
        parentBox._insetBounds.top +
        this._outsetBounds.top;
    }
  }

  setOutOfTreePosition({ x, y, z }: Position) {
    this._position.x = x;
    this._position.y = y;
    this._position.z = z;
  }

  setWidthConstrain(value: number) {
    this._dimensions.width.fixed = value;
  }

  setHeightConstrain(value: number) {
    this._dimensions.height.fixed = value;
  }

  setMaxDimensions({
    parentBox,
    variant,
    isSwitching,
  }: {
    parentBox: BoxModel,
    variant: Variant,
    isSwitching: boolean,
  }) {
    // If parent has fixed width/height or max value is set
    // (because other parent has fixed width/height), set max value to current
    // element, subtract inset bounds and space already taken from parent
    // only if the current element is inline and it's not switching between
    // either inline -> block or block -> inline.

    const { width: parentWidth, height: parentHeight } = parentBox._dimensions;

    if (getValue(parentWidth.fixed, parentWidth.max) > -1) {
      this._dimensions.width.max =
        getValue(parentWidth.fixed, parentWidth.max) -
        (this._insetBounds.left +
          this._insetBounds.right +
          (variant === 'current-line' && !isSwitching
            ? parentWidth.measured
            : 0));
    }

    if (getValue(parentHeight.fixed, parentHeight.max) > -1) {
      this._dimensions.height.max =
        getValue(parentHeight.fixed, parentHeight.max) -
        (this._insetBounds.top + this._insetBounds.bottom + variant ===
          'current-line' && !isSwitching
          ? 0
          : parentHeight.measured);
    }
  }

  getSize(): Size {
    return withBounds(
      {
        width: getValue(
          this._dimensions.width.fixed,
          this._dimensions.width.measured
        ),
        height: getValue(
          this._dimensions.height.fixed,
          this._dimensions.height.measured
        ),
      },
      this._insetBounds
    );
  }

  contains({ childBox }: { childBox: BoxModel }) {
    // Vertical check
    if (
      childBox._position.x +
        childBox.getSize().width +
        childBox._outsetBounds.right >
      this._position.x + this.getSize().width
    ) {
      return false;
    }
    // Horizontal check
    if (
      childBox._position.y +
        childBox.getSize().height +
        childBox._outsetBounds.bottom >
      this._position.y + this.getSize().height
    ) {
      return false;
    }

    return true;
  }

  resize({ width, height }: Size) {
    this._dimensions.width.measured = getMinValue(
      this._dimensions.width.fixed,
      this._dimensions.width.max,
      width
    );
    this._dimensions.height.measured = getMinValue(
      this._dimensions.height.fixed,
      this._dimensions.height.max,
      height
    );
  }

  resizeToContain({ childBox }: { childBox: BoxModel }) {
    const { width, height } = childBox.getSize();
    // NOTE: left and top inset bounds have to be subtracted, since
    // they were added in child's placement.
    // TODO: check that ^
    const xDiff = childBox._position.x - this._position.x;
    const yDiff = childBox._position.y - this._position.y;
    this.resize({
      width: Math.max(
        this._dimensions.width.measured,
        xDiff + width + childBox._outsetBounds.right
      ),
      height: Math.max(
        this._dimensions.height.measured,
        yDiff + height + childBox._outsetBounds.bottom
      ),
    });
  }
}

function getValue(...values: number[]) {
  const result = values.find(value => value > -1);
  return typeof result === 'undefined' ? -1 : result;
}

function getMinValue(...values: number[]) {
  return Math.min(...values.filter(value => value > -1));
}

function withBounds({ width, height }: Size, ...bounds: Bounds[]) {
  return {
    width: bounds.reduce((acc, { left, right }) => acc + left + right, width),
    height: bounds.reduce((acc, { top, bottom }) => acc + top + bottom, height),
  };
}
