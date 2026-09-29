export class NonElementParentNode extends ParentNode {
    getElementById(id: any): any;
    toJSON(): any[];
    [CLONE](document: any, deep: any): any;
}
import { ParentNode } from './parent-node.js';
import { CLONE } from '../shared/symbols.js';
