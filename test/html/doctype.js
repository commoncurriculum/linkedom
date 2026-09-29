const assert = require('../assert.js').for('DocumentType');

const {parseHTML, parseJSON, DOMParser} = global[Symbol.for('linkedom')];

let window = parseHTML(`
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN"
    "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd"><html></html>
`.trim()).window;

assert(window.document.firstChild.publicId, '-//W3C//DTD XHTML Basic 1.1//EN');
assert(window.document.firstChild.systemId, 'http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd');
assert(window.document.toString(), '<!DOCTYPE html><html><head></head><body></body></html>');
assert(window.document.firstChild.toString(), '<!DOCTYPE html>', 'an HTML doctype serializes as the document does');
assert(JSON.stringify(window.document), `[9,10,"html","-//W3C//DTD XHTML Basic 1.1//EN","http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd",1,"html",1,"head",-1,1,"body",-3]`);
let doctype = parseJSON(JSON.stringify(window.document)).firstChild;
assert(doctype.publicId, '-//W3C//DTD XHTML Basic 1.1//EN');
assert(doctype.systemId, 'http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd');
assert(doctype.toString(), '<!DOCTYPE html>');

window = parseHTML(`
<!DOCTYPE math SYSTEM
	"http://www.w3.org/Math/DTD/mathml1/mathml.dtd"><html></html>
`.trim()).window;

assert(window.document.firstChild.systemId, 'http://www.w3.org/Math/DTD/mathml1/mathml.dtd');
assert(window.document.toString(), '<!DOCTYPE math><html><head></head><body></body></html>');
assert(JSON.stringify(window.document), `[9,10,"math","http://www.w3.org/Math/DTD/mathml1/mathml.dtd",1,"html",1,"head",-1,1,"body",-3]`);
doctype = parseJSON(JSON.stringify(window.document)).firstChild;
assert(doctype.publicId, '');
assert(doctype.systemId, 'http://www.w3.org/Math/DTD/mathml1/mathml.dtd');
assert(doctype.toString(), '<!DOCTYPE math>');
assert(window.document.createDocumentType('svg', '-//W3C//DTD SVG 1.0//EN', 'http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd').toString(), '<!DOCTYPE svg>');

const svg = (new DOMParser).parseFromString('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg"/>', 'image/svg+xml');
assert(svg.doctype.toString(), '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">', 'an XML doctype keeps its identifiers');
assert(svg.createDocumentType('math', '', 'mathml.dtd').toString(), '<!DOCTYPE math SYSTEM "mathml.dtd">');
assert(svg.createDocumentType('x', '', '').toString(), '<!DOCTYPE x>');
