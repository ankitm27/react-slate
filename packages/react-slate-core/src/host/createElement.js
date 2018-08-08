/* @flow */

import { Node, Text } from '@react-slate/reflow';
import splitProps from './splitProps';

export default function createElement(type: string | Function, props: *) {
  if (typeof type === 'function') {
    return type;
  }

  const COMPONENTS = {
    VIEW_NODE: () => {
      const instance = new Node();
      const { layoutProps, styleProps } = splitProps(props);
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
