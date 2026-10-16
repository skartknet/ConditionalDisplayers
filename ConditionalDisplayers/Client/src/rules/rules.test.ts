import { describe, expect, it } from 'vitest';
import { evaluateGroup, isVisible, type SourceReader } from './evaluate';
import { inputFor, operatorsFor } from './operators';
import type { Condition } from './types';

const reader = (values: Record<string, unknown>): SourceReader => (k) =>
    k in values ? { exists: true, value: values[k] } : { exists: false };

const c = (propertyKey: string, operator: Condition['operator'], extra: Partial<Condition> = {}): Condition =>
    ({ propertyKey, operator, ...extra });

describe('operators', () => {
    it.each([
        ['isTicked', true, undefined, true],
        ['isTicked', false, undefined, false],
        ['isTicked', undefined, undefined, false],
        ['isNotTicked', false, undefined, true],
        ['isNotTicked', true, undefined, false],
        ['anyOf', 'a', ['a', 'b'], true],
        ['anyOf', 'c', ['a', 'b'], false],
        ['anyOf', ['c', 'b'], ['a', 'b'], true],
        ['anyOf', '', ['a'], false],
        ['noneOf', 'c', ['a', 'b'], true],
        ['noneOf', 'a', ['a', 'b'], false],
        ['noneOf', undefined, ['a'], true],
        ['equals', 'Hello', 'hello', true],
        ['equals', 'Hello', 'bye', false],
        ['notEquals', 'Hello', 'bye', true],
        ['contains', 'Hello world', 'WORLD', true],
        ['contains', 'Hello', 'x', false],
        ['isEmpty', '', undefined, true],
        ['isEmpty', '  ', undefined, true],
        ['isEmpty', [], undefined, true],
        ['isEmpty', null, undefined, true],
        ['isEmpty', 0, undefined, false],
        ['isEmpty', false, undefined, false],
        ['isNotEmpty', 'x', undefined, true],
        ['isNotEmpty', '', undefined, false],
        ['eq', 5, 5, true],
        ['eq', '5', 5, true],
        ['neq', 4, 5, true],
        ['gt', 6, 5, true],
        ['gt', 5, 5, false],
        ['gte', 5, 5, true],
        ['lt', 4, 5, true],
        ['lte', 5, 5, true],
        ['lte', 6, 5, false],
    ] as const)('%s on %j with %j is %s', (operator, value, expected, result) => {
        expect(evaluateGroup([c('p', operator, { value: expected })], reader({ p: value }))).toBe(result);
    });

    it('treats an empty or non-numeric source as false for every number operator', () => {
        for (const op of ['eq', 'neq', 'gt', 'lt', 'gte', 'lte'] as const) {
            expect(evaluateGroup([c('p', op, { value: 5 })], reader({ p: '' }))).toBe(false);
            expect(evaluateGroup([c('p', op, { value: 5 })], reader({ p: 'abc' }))).toBe(false);
        }
    });
});

describe('AND/OR precedence', () => {
    const t = c('t', 'isTicked');
    const f = c('f', 'isTicked');
    const r = reader({ t: true, f: false });

    it('is just the condition when there is one', () => {
        expect(evaluateGroup([t], r)).toBe(true);
        expect(evaluateGroup([f], r)).toBe(false);
    });

    it('ands and ors', () => {
        expect(evaluateGroup([t, { ...f, connector: 'and' }], r)).toBe(false);
        expect(evaluateGroup([t, { ...f, connector: 'or' }], r)).toBe(true);
        expect(evaluateGroup([f, { ...f, connector: 'or' }], r)).toBe(false);
    });

    it('binds AND tighter than OR: T or F and F is T or (F and F)', () => {
        expect(evaluateGroup([t, { ...f, connector: 'or' }, { ...f, connector: 'and' }], r)).toBe(true);
    });

    it('binds AND tighter than OR: F and T or T is (F and T) or T', () => {
        expect(evaluateGroup([f, { ...t, connector: 'and' }, { ...t, connector: 'or' }], r)).toBe(true);
    });

    it('binds AND tighter than OR: F or T and F is F or (T and F)', () => {
        expect(evaluateGroup([f, { ...t, connector: 'or' }, { ...f, connector: 'and' }], r)).toBe(false);
    });
});

describe('missing sources', () => {
    const t = c('t', 'isTicked');
    const gone = c('gone', 'isTicked');
    const r = reader({ t: true });

    it('are dropped, not treated as false', () => {
        expect(evaluateGroup([t, { ...gone, connector: 'and' }], r)).toBe(true);
    });

    it('leave null when nothing is left', () => {
        expect(evaluateGroup([gone], r)).toBeNull();
        expect(evaluateGroup([], r)).toBeNull();
    });

    it('drop a condition from inside an AND run, keeping its neighbours', () => {
        // A or (B and C), B missing => A or C
        const a = c('a', 'isTicked');
        const cc = c('c', 'isTicked');
        const rr = reader({ a: false, c: true });
        expect(evaluateGroup([a, { ...gone, connector: 'or' }, { ...cc, connector: 'and' }], rr)).toBe(true);
    });

    it('drop a leading condition without breaking the run', () => {
        expect(evaluateGroup([gone, { ...t, connector: 'and' }], r)).toBe(true);
    });
});

describe('isVisible', () => {
    const tick = (k: string) => c(k, 'isTicked');
    const r = reader({ on: true, off: false });

    it('is visible with no rules', () => {
        expect(isVisible({ show: [], hide: [] }, r)).toBe(true);
    });

    it('hides when Show has conditions and none match', () => {
        expect(isVisible({ show: [tick('off')], hide: [] }, r)).toBe(false);
        expect(isVisible({ show: [tick('on')], hide: [] }, r)).toBe(true);
    });

    it('hides when Hide matches', () => {
        expect(isVisible({ show: [], hide: [tick('on')] }, r)).toBe(false);
        expect(isVisible({ show: [], hide: [tick('off')] }, r)).toBe(true);
    });

    it('lets Hide win over Show', () => {
        expect(isVisible({ show: [tick('on')], hide: [tick('on')] }, r)).toBe(false);
    });

    it('is visible when every Show source is missing', () => {
        expect(isVisible({ show: [tick('gone')], hide: [] }, r)).toBe(true);
    });

    it('ignores a Hide group whose sources are all missing', () => {
        expect(isVisible({ show: [], hide: [tick('gone')] }, r)).toBe(true);
    });
});

describe('operatorsFor', () => {
    it('maps schema aliases to operator sets', () => {
        expect(operatorsFor('Umbraco.TrueFalse')).toEqual(['isTicked', 'isNotTicked']);
        expect(operatorsFor('Umbraco.DropDown.Flexible')).toEqual(['anyOf', 'noneOf']);
        expect(operatorsFor('Umbraco.RadioButtonList')).toEqual(['anyOf', 'noneOf']);
        expect(operatorsFor('Umbraco.CheckBoxList')).toEqual(['anyOf', 'noneOf']);
        expect(operatorsFor('Umbraco.TextBox')).toContain('contains');
        expect(operatorsFor('Umbraco.Integer')).toContain('gte');
        expect(operatorsFor('Umbraco.Decimal')).toContain('lte');
        expect(operatorsFor('Umbraco.ImageCropper')).toEqual(['isEmpty', 'isNotEmpty']);
        expect(operatorsFor(undefined)).toEqual(['isEmpty', 'isNotEmpty']);
    });

    it('treats our own plain-string list editors as list sources', () => {
        expect(operatorsFor('Umbraco.Plain.String', 'Our.Umbraco.CdRadio')).toEqual(['anyOf', 'noneOf']);
        expect(operatorsFor('Umbraco.Plain.String', 'Our.Umbraco.CdDropdownFlexible')).toEqual(['anyOf', 'noneOf']);
        expect(operatorsFor('Umbraco.Plain.String')).toEqual(['isEmpty', 'isNotEmpty']);
    });

    it('says which input each operator needs', () => {
        expect(inputFor('isTicked')).toBe('none');
        expect(inputFor('anyOf')).toBe('list');
        expect(inputFor('contains')).toBe('text');
        expect(inputFor('gte')).toBe('number');
        expect(inputFor('isEmpty')).toBe('none');
    });
});
