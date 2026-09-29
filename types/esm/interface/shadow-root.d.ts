/**
 * @implements globalThis.ShadowRoot
 */
export class ShadowRoot extends NonElementParentNode implements globalThis.ShadowRoot {
    constructor(host: any);
    host: any;
    set innerHTML(html: string);
    get innerHTML(): string;
    [CLONE](): void;
}
import { NonElementParentNode } from '../mixin/non-element-parent-node.js';
import { CLONE } from '../shared/symbols.js';
