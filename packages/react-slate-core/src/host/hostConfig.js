/* @flow */

/* eslint-disable no-param-reassign */

import { typeof Root, typeof Text, Node, render } from '@react-slate/reflow';
// $FlowFixMe
import emptyObject from 'fbjs/lib/emptyObject';
// $FlowFixMe
import shallowEqual from 'fbjs/lib/shallowEqual';
import createElement from './createElement';
import splitStyleProps from './splitStyleProps';
import type { Target } from '../types';

const NOOP = () => {};
const RETURN_EMPTY_OBJ = () => emptyObject;
const NO = () => false;

export default (containerInstance: Root, target: Target) => ({
  // Create instance of host environment specific node or instance of a component.
  createInstance(type: string | Function, props: *) {
    return createElement(type, props);
  },

  createTextInstance(text: string) {
    return createElement('TEXT_NODE', { children: text });
  },

  // Container handlers

  insertInContainerBefore(container: Root, child: *, childBefore: *) {
    container.prependChild(child, childBefore);
  },

  appendChildToContainer(container: Root, child: *) {
    container.appendChild(child);
  },

  removeChildFromContainer(container: Root, child: *) {
    container.removeChild(child);
  },

  // Default handlers

  appendInitialChild(parentInstance: Node, child: *) {
    parentInstance.appendChild(child);
  },

  appendChild(parentInstance: Node, child: *) {
    parentInstance.appendChild(child);
  },

  removeChild(parentInstance: Node, child: *) {
    parentInstance.removeChild(child);
  },

  insertBefore(parentInstance: Node, child: *, childBefore: *) {
    parentInstance.prependChild(child, childBefore);
  },

  // Update handlers

  prepareUpdate() {
    return true;
  },

  commitUpdate(
    instance: Node,
    updatePayload: *,
    type: string,
    oldProps: *,
    newProps: *
  ) {
    // TODO: handle style props separately to avoid unnecessary rendering
    // since style prop will always trigger new render.
    if (!shallowEqual(oldProps, newProps) && instance instanceof Node) {
      const { layoutProps, styleProps } = splitStyleProps(newProps.style);
      instance.setLayoutProps(layoutProps);
      instance.setStyleProps(styleProps);
    }
  },

  commitTextUpdate(textInstance: Text, oldText: string, newText: string) {
    textInstance.setBody(newText);
  },

  resetAfterCommit() {
    // This hooks is called once per update, whereas commitUpdate is called multiple times, for
    // each updated node. So here is the best place to flush data to host environment, using
    // container instance.
    try {
      const { renderElements } = containerInstance.calculateLayout();
      const output = render(renderElements, target.getSize());
      target.setCursorPosition(0, 0);
      target.clear();
      target.print(output);
    } catch (error) {
      target.raiseError(error);
    }
  },

  // Misc

  getPublicInstance(inst: *) {
    return inst;
  },

  commitMount: NOOP,
  getRootHostContext: RETURN_EMPTY_OBJ,
  getChildHostContext: RETURN_EMPTY_OBJ,
  prepareForCommit: NOOP,
  shouldSetTextContent: NO,
  resetTextContent: NOOP,
  finalizeInitialChildren: NOOP,
  now: NOOP,

  useSyncScheduling: true,
  supportsMutation: true,
});
