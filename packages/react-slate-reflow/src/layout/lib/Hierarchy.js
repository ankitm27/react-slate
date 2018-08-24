/* @flow */

import type { RenderElement, PlacementValue } from '../../types';

type Layer = RenderElement[];
type Index = {
  layer: number,
  position: number,
};

export default class Hierarchy {
  layers: { [key: string]: Layer } = {};

  getIndex({ z: zPosition = 0 }: PlacementValue) {
    const key = zPosition.toString();
    if (!this.layers[key]) {
      this.layers[key] = [];
    }
    return {
      layer: zPosition,
      position: this.layers[key].length,
    };
  }

  insertElements(index: Index, elements: RenderElement[]) {
    // debugger // eslint-disable-line
    const key = index.layer.toString();
    this.layers[key].splice(index.position, 0, ...elements);
  }

  toArray() {
    // debugger // eslint-disable-line
    return Object.keys(this.layers)
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
      .reduce((acc, layerKey) => [...acc, ...this.layers[layerKey]], [])
      .filter(
        // Remove body elements with empty value.
        (element: RenderElement) =>
          element && element.body ? element.body.value.length : Boolean(element)
      );
  }
}
