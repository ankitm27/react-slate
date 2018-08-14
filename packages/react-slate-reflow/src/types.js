/* @flow */

import type Text from './nodes/Text';
import type View from './nodes/View';
import type Root from './nodes/Root';

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
  measuredWidth: number,
  measuredHeight: number,
  fixedWidth: number,
  fixedHeight: number,
  usedWidth: number,
  usedHeight: number,
  finalWidth: number,
  finalHeight: number,
  availableWidth: number,
  availableHeight: number,
};

export type Size = {
  width: number,
  height: number,
};

type JsonLayoutTree = {
  type: string,
  dimensions: Size,
  placement: Placement,
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
