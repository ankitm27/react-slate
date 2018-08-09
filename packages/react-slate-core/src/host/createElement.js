/* @flow */

import { Node, Text } from '@react-slate/reflow';
import splitStyleProps from './splitStyleProps';

export default function createElement(type: string | Function, props: Object) {
  if (typeof type === 'function') {
    return type;
  }

  const COMPONENTS = {
    VIEW_NODE: () => {
      const instance = new Node();
      const { layoutProps, styleProps } = splitStyleProps(props && props.style);
      instance.setLayoutProps(layoutProps);
      instance.setStyleProps(styleProps);
      return instance;
    },
    TEXT_NODE: () => {
      const instance = new Text();
      instance.setBody(props.children);
      return instance;
    },
    default: () => undefined,
  };

  return COMPONENTS[type]() || COMPONENTS.default;
}
