/* @flow */

import type Text from './nodes/Text';
import type View from './nodes/View';
import type Root from './nodes/Root';
import type Dimensions from './layout/lib/Dimensions';
import type Placement from './layout/lib/Placement';

export interface Traversable<T> {
  children: Array<Traversable<T>>;
}

export type Child = View | Text;
export type Parent = Root | View;

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
  position?: 'relative' | 'absolute',
  zIndex?: number,
  left?: number,
  top?: number,
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

export type PlacementValue = {
  x: number,
  y: number,
  z: number,
};

export type Size = {
  width: number,
  height: number,
};

type JsonLayoutTree = {
  type: string,
  dimensions: Size,
  placement: PlacementValue,
  body?: string,
  children?: JsonLayoutTree[],
};

export interface LayoutElement<N> {
  backingInstance: LayoutElement<N>;

  node: N;
  parent: LayoutElement<*> | LayoutElementDelegate<*>;
  children: Array<LayoutElement<*> | LayoutElementDelegate<*>>;
  lastChild: ?(LayoutElement<*> | LayoutElementDelegate<*>);

  dimensions: *;
  placement: Placement;
  insetBounds: Bounds;
  outsetBounds: Bounds;
  isInline: boolean;
  isAbsolute: boolean;

  getDimensions(): Dimensions;
  updateDimensions(LayoutElement<*> | LayoutElementDelegate<*>): void;
  hasRenderElements(): boolean;
  getRenderElements(): RenderElement[];
  getLayoutTree(): JsonLayoutTree;
}

export interface LayoutElementDelegate<B> {
  backingInstance: LayoutElement<B>;

  getDimensions(): Dimensions;
  updateDimensions(LayoutElement<*> | LayoutElementDelegate<*>): void;
  hasRenderElements(): boolean;
  getRenderElements(): RenderElement[];
  getLayoutTree(): JsonLayoutTree;
}
