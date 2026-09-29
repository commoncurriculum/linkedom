const assert = require('../assert.js').for('Event');

const {parseHTML} = global[Symbol.for('linkedom')];

const {Event, document} = parseHTML('<html><div /></html>');

let event = document.createEvent('Event');
event.initEvent('test-event');

let bubblingClickEvent = document.createEvent('HTMLEvents');
bubblingClickEvent.initEvent('click', true);

let customEvent = document.createEvent('CustomEvent');
customEvent.initCustomEvent('click', false, false, 123);

let args = null;
let documentArgs = null;
let composedPathArgs = [];

let node = document.getElementsByTagName('div')[0];
document.addEventListener('click', (ev) => {
  documentArgs = {
    target: ev.target,
    currentTarget: ev.currentTarget
  };
  composedPathArgs = ev.composedPath();
});
node.addEventListener('click', {
  handleEvent(event) {
    args = event;
  }
});

args = null;
documentArgs = null;

node.dispatchEvent(new Event('click'));
assert(args.type, 'click', 'handleEvent works');
assert(documentArgs, null)

args = null;
documentArgs = null;

node.dispatchEvent(customEvent);
assert(args.detail, 123, 'custom event works');
assert(documentArgs, null)

node.dispatchEvent(bubblingClickEvent);

assert(documentArgs.target, node, 'bubbled to document and node is target');
assert(documentArgs.currentTarget, document, 'bubbled to document and node is currentTarget');
assert(composedPathArgs.length, 5, 'should have 5 targets: div, body, html, document, window');
assert(composedPathArgs[0], node, 'first is the node');
assert(composedPathArgs[2], document.firstChild, 'third the html');
assert(composedPathArgs[3], document, 'fourth the document');
assert(composedPathArgs[1], document.body, 'second the body');
assert('nodeType' in composedPathArgs[4], false, 'last the window, which is no node');
let windowArgs = null;
document.defaultView.addEventListener('click', function (event) { windowArgs = [this, event.currentTarget]; });
node.dispatchEvent(bubblingClickEvent);
assert(windowArgs[1], composedPathArgs[4], 'the window listens on it');
