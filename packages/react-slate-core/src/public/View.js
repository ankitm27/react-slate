/* @flow */

import * as React from 'react';

import type { Style } from '../types';

type Children = React.Element<*> | string | number | Array<Children>;
type Props = {
  style?: Style,
  children: Children,
};

const ViewNode = 'VIEW_NODE';

export default function View(props: Props) {
  const { children, style, ...rest } = props;
  // $FlowFixMe
  // const { internal_do_not_use_render } = props; // eslint-disable-line camelcase
  return (
    <ViewNode
      style={style}
      {...rest}
      // internal_do_not_use_render={internal_do_not_use_render} // eslint-disable-line camelcase
    >
      {children}
    </ViewNode>
  );
}
