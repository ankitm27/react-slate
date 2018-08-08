/* @flow */

import ReactFiberReconciler from 'react-reconciler';
import { Root } from '@react-slate/reflow';

import type { Target } from '../types';

import hostConfig from '../host/hostConfig';
import onExit from '../utils/onExit';

const targetMap = new WeakMap();

export default function render(
  element: any,
  target: Target,
  callback: ?Function = null
) {
  onExit(() => {
    if (targetMap.has(target)) {
      const { node, reconciler } = (targetMap.get(target): any);
      reconciler.updateContainer(null, node, null);
    }
  });

  if (targetMap.has(target)) {
    const { node, reconciler } = (targetMap.get(target): any);
    reconciler.updateContainer(element, node, null, callback);
  } else {
    const container = new Root(target.getSize());
    const reconciler = ReactFiberReconciler(hostConfig(container, target));
    const node = reconciler.createContainer(container);
    targetMap.set(target, {
      container,
      node,
      reconciler,
    });
    reconciler.updateContainer(element, node, null, callback);
  }
}
