/* @flow */

import ContainerLayout from './ContainerLayout';
import UnitLayout from './UnitLayout';
import Dimensions from '../Dimensions';
import type {
  Bounds,
  Placement,
  ContainerLayoutBuilder,
  UnitLayoutBuilder,
} from '../../types';

export default class RootLayout {
  children: Array<ContainerLayout | UnitLayout> = [];
  lastChildLayout: ?(ContainerLayout | UnitLayout) = null;
  placement: Placement = { x: 0, y: 0 };
  dimensions = new Dimensions();
  insetBounds: Bounds = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  getDimensionsWithBounds() {
    return this.dimensions;
  }

  calculateDimensions(childLayout: ContainerLayoutBuilder | UnitLayoutBuilder) {
    return ContainerLayout.prototype.calculateDimensions.call(
      this,
      childLayout
    );
  }

  getJsonTree() {
    return {
      type: RootLayout.name,
      dimensions: this.dimensions.valueOf(),
      placement: this.placement,
      // $FlowFixMe
      children: this.children.map((child: ContainerLayout | UnitLayout) =>
        child.getJsonTree()
      ),
    };
  }
}
