const assert = require('../assert.js').for('getElementsByClassName');

const {parseHTML} = global[Symbol.for('linkedom')];

const {document} = parseHTML('<!doctype html><html><head></head><body></body></html>');
document.body.innerHTML = '<div id="a" class="a b"><p id="b" class=" b&#9;c "></p><p id="c" class="A"></p><p id="d" class="a:b 1x"></p><i id="e" class=""></i><i id="f"></i><svg><g id="g" class="a b"></g></svg></div>';

const ids = list => list.map(({id}) => id).join();
const byClass = classNames => ids(document.getElementsByClassName(classNames));

assert(byClass('a'), 'a,g', 'one class');
assert(byClass('b'), 'a,b,g', 'whitespace around classes in the attribute is ignored');
assert(byClass('a b'), 'a,g', 'several classes match elements that have them all');
assert(byClass('b a'), 'a,g', 'in any order');
assert(byClass('a a'), 'a,g', 'once each');
assert(byClass(' b '), 'a,b,g', 'whitespace around the argument is ignored');
assert(byClass('\tb\nc\f'), 'b', 'any ASCII whitespace separates classes');
assert(byClass('b c'), '', 'but not a no-break space');
assert(byClass('A'), 'c', 'classes match case-sensitively');
assert(byClass('a:b'), 'd', 'a class is not a selector');
assert(byClass('1x'), 'd');
assert(byClass('a:b 1x'), 'd');
assert(byClass(''), '', 'no classes match nothing');
assert(byClass('   '), '');
assert(byClass(null), '', 'the argument is converted to a string');
assert(ids(document.getElementById('a').getElementsByClassName('b')), 'b,g', 'only descendants');

const fragment = document.createDocumentFragment();
fragment.append(document.createElement('p'));
fragment.firstChild.className = 'z';
assert(fragment.getElementsByClassName('z').length, 1, 'in a fragment');

assert(byClass('b'), 'a,b,g');
document.getElementById('c').className = 'b';
assert(byClass('b'), 'a,b,c,g', 'a changed class');
document.getElementById('c').classList.remove('b');
assert(byClass('b'), 'a,b,g', 'a removed class');
document.getElementById('b').remove();
assert(byClass('b'), 'a,g', 'a removed element');
document.getElementById('f').setAttribute('class', 'b');
assert(byClass('b'), 'a,f,g', 'a set attribute');
