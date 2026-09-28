import {ELEMENT_NODE} from './constants.js';
import {END, MIME, NEXT, PREV} from './symbols.js';

const $String = String;
export {$String as String};

export const getEnd = node => node.nodeType === ELEMENT_NODE ? node[END] : node;

export const ignoreCase = ({ownerDocument}) => ownerDocument[MIME].ignoreCase;

export const knownAdjacent = (prev, next) => {
  prev[NEXT] = next;
  next[PREV] = prev;
};

export const knownBoundaries = (prev, current, next) => {
  knownAdjacent(prev, current);
  knownAdjacent(getEnd(current), next);
};

export const knownSegment = (prev, start, end, next) => {
  knownAdjacent(prev, start);
  knownAdjacent(getEnd(end), next);
};

export const knownSiblings = (prev, current, next) => {
  knownAdjacent(prev, current);
  knownAdjacent(current, next);
};

/**
 * Links a node into the tree without running any insertion steps.
 * @param {Node} parentNode
 * @param {Node} node
 * @param {Node} next the node, or the end, it goes before
 */
export const linkNode = (parentNode, node, next = parentNode[END]) => {
  node.parentNode = parentNode;
  knownBoundaries(next[PREV], node, next);
};

/**
 * Links an attribute to an element without running any attribute change steps.
 * @param {Element} element
 * @param {Attr} attribute
 * @param {Node} last the element or its attribute this one follows
 */
export const linkAttribute = (element, attribute, last = element[END][PREV]) => {
  attribute.ownerElement = element;
  knownSiblings(last, attribute, last[NEXT]);
};

export const setAdjacent = (prev, next) => {
  if (prev)
    prev[NEXT] = next;
  if (next)
    next[PREV] = prev;
};
