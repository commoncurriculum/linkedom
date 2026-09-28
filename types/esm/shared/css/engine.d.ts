/**
 * @returns {string[]}
 */
export function propertyNames(): string[];
export class Declarations {
    /**
     * @param {string} css
     */
    constructor(css: string);
    __destroy_into_raw(): any;
    __wbg_ptr: any;
    free(): void;
    /**
     * @returns {string}
     */
    cssText(): string;
    /**
     * @param {number} index
     * @returns {string | undefined}
     */
    item(index: number): string | undefined;
    /**
     * @returns {number}
     */
    get length(): number;
    /**
     * @param {string} name
     * @returns {string}
     */
    priority(name: string): string;
    /**
     * @param {string} name
     * @returns {string | undefined}
     */
    remove(name: string): string | undefined;
    /**
     * @param {string} name
     * @param {string} value
     * @param {string} priority
     * @returns {boolean}
     */
    set(name: string, value: string, priority: string): boolean;
    /**
     * @param {string} name
     * @returns {string}
     */
    value(name: string): string;
}
export function initSync(module: any): any;
