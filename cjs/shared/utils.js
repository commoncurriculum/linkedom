'use strict';
const {ELEMENT_NODE} = require('./constants.js');
const {CLONE, END, MIME, NEXT, PREV} = require('./symbols.js');

const $String = String;
exports.String = $String;

const getEnd = node => node.nodeType === ELEMENT_NODE ? node[END] : node;
exports.getEnd = getEnd;

const ignoreCase = ({ownerDocument}) => ownerDocument[MIME].ignoreCase;
exports.ignoreCase = ignoreCase;

const knownAdjacent = (prev, next) => {
  prev[NEXT] = next;
  next[PREV] = prev;
};
exports.knownAdjacent = knownAdjacent;

const knownBoundaries = (prev, current, next) => {
  knownAdjacent(prev, current);
  knownAdjacent(getEnd(current), next);
};
exports.knownBoundaries = knownBoundaries;

const knownSegment = (prev, start, end, next) => {
  knownAdjacent(prev, start);
  knownAdjacent(getEnd(end), next);
};
exports.knownSegment = knownSegment;

const knownSiblings = (prev, current, next) => {
  knownAdjacent(prev, current);
  knownAdjacent(current, next);
};
exports.knownSiblings = knownSiblings;

/**
 * Links a node into the tree without running any insertion steps.
 * @param {Node} parentNode
 * @param {Node} node
 * @param {Node} next the node, or the end, it goes before
 */
const linkNode = (parentNode, node, next = parentNode[END]) => {
  node.parentNode = parentNode;
  knownBoundaries(next[PREV], node, next);
};
exports.linkNode = linkNode;

/**
 * Links an attribute to an element without running any attribute change steps.
 * @param {Element} element
 * @param {Attr} attribute
 * @param {Node} last the element or its attribute this one follows
 */
const linkAttribute = (element, attribute, last = element[END][PREV]) => {
  attribute.ownerElement = element;
  knownSiblings(last, attribute, last[NEXT]);
};
exports.linkAttribute = linkAttribute;

/**
 * Links to parentNode a deep clone of each child of source, without running any insertion steps.
 * @param {Node} source
 * @param {Node} parentNode
 * @param {Document} document the document the clones belong to
 */
const linkClones = (source, parentNode, document) => {
  for (let child = source.firstChild; child; child = child.nextSibling)
    linkNode(parentNode, child[CLONE](document, true));
};
exports.linkClones = linkClones;

const setAdjacent = (prev, next) => {
  if (prev)
    prev[NEXT] = next;
  if (next)
    next[PREV] = prev;
};
exports.setAdjacent = setAdjacent;
