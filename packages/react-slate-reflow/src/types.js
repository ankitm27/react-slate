/* @flow */

import type Text from './nodes/Text';
import type Node from './nodes/Node';
import type Root from './nodes/Root';

export interface Traversable<T> {
  children: Array<Traversable<T>>;
}

export type Child = Node | Text;
export type Parent = Root | Node;

export type LayoutProps = {
  marginLeft?: number,
  marginRight?: number,
  marginTop?: number,
  marginBottom?: number,
  paddingLeft?: number,
  paddingRight?: number,
  paddingTop?: number,
  paddingBottom?: number,
  display?: 'block' | 'inline',
  width?: number | string,
  height?: number | string,
};

export type Bounds = {
  top: number,
  right: number,
  bottom: number,
  left: number,
};

export type BoxStyle = {
  backgroundColor?: string,
};

export type BodyStyle = {
  color?: string,
  fontWeight?: string,
  fontStyle?: string,
  textDecoration?: string,
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase',
  textAlign?: 'left' | 'center' | 'right',
};

export type StyleProps = BoxStyle & BodyStyle;

export type BorderProps = {
  thickness: 'single-line' | 'double-line',
  color?: string,
  backgroundColor?: string,
};

export type Box = {
  style: ?BoxStyle,
  x: number,
  y: number,
  width: number,
  height: number,
};

export type Body = {
  value: string,
  x: number,
  y: number,
  style: ?BodyStyle,
};

export type RenderElement = {
  box?: Box,
  body?: Body,
};

export type Placement = {
  x: number,
  y: number,
};

export type Dimensions = {
  width: number,
  height: number,
};

type JsonLayoutTree = {
  type: string,
  dimensions: Dimensions,
  placement: Placement,
  body?: string,
  children?: JsonLayoutTree[],
};

export interface ContainerLayoutBuilder {
  calculatePlacement(): void;
  getDimensionsWithBounds(): Dimensions;
  calculateDimensions(ContainerLayoutBuilder | UnitLayoutBuilder): void;
  getJsonTree(): JsonLayoutTree;
  shouldMakeRenderElements(): boolean;
  makeRenderElements(): RenderElement[];
}
export interface UnitLayoutBuilder {
  calculatePlacement(): void;
  getDimensionsWithBounds(): Dimensions;
  getJsonTree(): JsonLayoutTree;
  makeRenderElement(): RenderElement;
}
