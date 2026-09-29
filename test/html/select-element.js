const assert = require('../assert.js').for('HTMLSelectElement');

const {parseHTML} = global[Symbol.for('linkedom')];

let {document} = parseHTML('<select></select>');
let {firstElementChild: select} = document.body;

select.innerHTML = '<option></option><option selected value="OK"></option>';
assert(select.toString(), '<select><option></option><option selected="" value="OK"></option></select>');
assert(select.value, 'OK');
assert(select.options[0].selected, false);
assert(select.options[1].selected, true);
select.options[0].selected = true;
assert(select.toString(), '<select><option></option><option selected="" value="OK"></option></select>', 'selectedness leaves the attribute alone');
assert(select.options[0].selected, true, 'selecting an option');
assert(select.options[1].selected, false, 'deselects the others');
assert(select.value, '', 'and gives the select its value');
select.options[0].selected = true;
assert(select.options[0].selected, true);

({document} = parseHTML('<select><option></option><optgroup><option></option></optgroup></select>'));
({firstElementChild: select} = document.body);
assert(select.options.toString(), '<option></option>,<option></option>');
assert(select.options.length, 2);

const selectOf = html => parseHTML(`<!doctype html><html><body>${html}</body></html>`).document.querySelector('select');
const selected = select => select.options.map(option => option.selected).join();

select = selectOf('<select><option selected>a</option><option selected>b</option></select>');
assert(select.value, 'b', 'the last selected option wins');
assert(selected(select), 'false,true', 'and is the only one selected');

select = selectOf('<select><option>a</option><option>b</option></select>');
assert(select.value, 'a', 'without a selected option, the first one');
assert(selected(select), 'true,false', 'is selected');

select = selectOf('<select><option disabled>a</option><optgroup disabled><option>b</option></optgroup><option>c</option></select>');
assert(select.value, 'c', 'the first enabled one');
assert(selected(select), 'false,false,true');

select = selectOf('<select><option>a</option><option selected>b</option></select>');
select.options[1].selected = false;
assert(select.value, 'a', 'deselecting the selected option falls back to the first');
assert(selected(select), 'true,false');
select.insertAdjacentHTML('beforeend', '<option selected>c</option>');
assert(select.value, 'c', 'an option added with selected wins');
assert(selected(select), 'false,false,true');
select.options[0].selected = true;
assert(select.value, 'a');
assert(selected(select), 'true,false,false');

select = selectOf('<select><option>a</option><div>not an option</div><optgroup><option>b</option><p>no</p></optgroup></select>');
assert(select.options.length, 2, 'only options are options');

select = selectOf('<select multiple><option>a</option><option>b</option></select>');
assert(select.multiple, true);
assert(select.value, '', 'a multiple select selects nothing by itself');
assert(selected(select), 'false,false');
select.options[1].selected = true;
select.options[0].selected = true;
assert(selected(select), 'true,true', 'and keeps every selected option');
assert(select.value, 'a', 'its value is the first');
select.multiple = false;
assert(select.hasAttribute('multiple'), false);
assert(select.value, 'b', 'a single select then keeps the last');

const option = document.createElement('option');
assert(option.selected, false, 'an option outside a select follows its attribute');
option.defaultSelected = true;
assert(option.selected, true);
option.selected = false;
option.defaultSelected = true;
assert(option.selected, false, 'until its selectedness is set');
