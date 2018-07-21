/* @flow */

import type { Dimensions as DimensionsValue } from '../types';

const NoConstrain = value => value;
const INTERNAL = Symbol('INTERNAL');

export default class Dimensions {
  // $FlowFixMe
  [INTERNAL] = {
    width: {
      measured: 0,
      final: 0,
      constrain: NoConstrain,
    },
    height: {
      measured: 0,
      final: 0,
      constrain: NoConstrain,
    },
  };

  get width(): number {
    // $FlowFixMe
    return this[INTERNAL].width.final;
  }

  set width(value: number) {
    // $FlowFixMe
    const internal = this[INTERNAL];
    internal.width.measured = value;
    internal.width.final = internal.width.constrain(value);
  }

  get height(): number {
    // $FlowFixMe
    return this[INTERNAL].height.final;
  }

  set height(value: number) {
    // $FlowFixMe
    const internal = this[INTERNAL];
    internal.height.measured = value;
    internal.height.final = internal.height.constrain(value);
  }

  hasWidthConstrain() {
    // $FlowFixMe
    return this[INTERNAL].width.constrain !== NoConstrain;
  }

  hasHeightConstrain() {
    // $FlowFixMe
    return this[INTERNAL].height.constrain !== NoConstrain;
  }

  setWidthConstrain(constrain: number => number) {
    // $FlowFixMe
    this[INTERNAL].width.constrain = constrain;
  }

  setHeightConstrain(constrain: number => number) {
    // $FlowFixMe
    this[INTERNAL].height.constrain = constrain;
  }

  valueOf(): DimensionsValue {
    // $FlowFixMe
    const { width, height } = this[INTERNAL];
    return {
      width: width.final,
      height: height.final,
    };
  }
}
