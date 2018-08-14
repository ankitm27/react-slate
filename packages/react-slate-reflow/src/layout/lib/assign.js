/* @flow */

/**
 * Copies properties from sources to target including getters.
 */
export default function assign(target: *, ...sources: *[]) {
  sources.forEach(source => {
    Object.keys(source).forEach(key => {
      Object.defineProperty(
        target,
        key,
        Object.getOwnPropertyDescriptor(source, key) || { value: undefined }
      );
    });
  });
  return target;
}
