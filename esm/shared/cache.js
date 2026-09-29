export const childNodesWM = new WeakMap;
export const childrenWM = new WeakMap;
export const elementsByClassNameWM = new WeakMap;
export const elementsByTagNameWM = new WeakMap;
export const querySelectorWM = new WeakMap;
export const querySelectorAllWM = new WeakMap;

export const get = (wm, self, method) => {
  if (wm.has(self))
    return wm.get(self);
  const value = method.call(self);
  wm.set(self, value);
  return value;
};

export const reset = parentNode => {
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
