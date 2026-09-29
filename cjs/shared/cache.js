'use strict';
const childNodesWM = new WeakMap;
exports.childNodesWM = childNodesWM;
const childrenWM = new WeakMap;
exports.childrenWM = childrenWM;
const elementsByClassNameWM = new WeakMap;
exports.elementsByClassNameWM = elementsByClassNameWM;
const elementsByTagNameWM = new WeakMap;
exports.elementsByTagNameWM = elementsByTagNameWM;
const querySelectorWM = new WeakMap;
exports.querySelectorWM = querySelectorWM;
const querySelectorAllWM = new WeakMap;
exports.querySelectorAllWM = querySelectorAllWM;

const get = (wm, self, method) => {
  if (wm.has(self))
    return wm.get(self);
  const value = method.call(self);
  wm.set(self, value);
  return value;
};
exports.get = get;

const reset = parentNode => {
  while (parentNode) {
    childNodesWM.delete(parentNode);
    childrenWM.delete(parentNode);
    elementsByClassNameWM.delete(parentNode);
    elementsByTagNameWM.delete(parentNode);
    querySelectorWM.delete(parentNode);
    querySelectorAllWM.delete(parentNode);
    parentNode = parentNode.parentNode;
  }
};
exports.reset = reset;
