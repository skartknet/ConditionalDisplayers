import type { Condition, RuleSet } from './types';

/** What the evaluator knows about a source property. `exists: false` means it isn't on this content type. */
export type SourceReader = (propertyKey: string) => { exists: boolean; value?: unknown };

export function isEmptyValue(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value as object).length === 0;
    return false;
}

const toList = (value: unknown): string[] =>
    (Array.isArray(value) ? value : isEmptyValue(value) ? [] : [value]).map(String);

const toNumber = (value: unknown): number =>
    isEmptyValue(value) || typeof value === 'object' ? NaN : Number(value);

const text = (value: unknown): string => String(value ?? '').toLowerCase();

/** Text matching is case-insensitive; a number comparison against an empty or non-numeric value is always false. */
function matches(condition: Condition, value: unknown): boolean {
    const expected = condition.value;
    switch (condition.operator) {
        case 'isTicked': return value === true;
        case 'isNotTicked': return value !== true;
        case 'isEmpty': return isEmptyValue(value);
        case 'isNotEmpty': return !isEmptyValue(value);
        case 'anyOf': {
            const wanted = toList(expected);
            return toList(value).some((v) => wanted.includes(v));
        }
        case 'noneOf': {
            const wanted = toList(expected);
            return !toList(value).some((v) => wanted.includes(v));
        }
        case 'equals': return text(value) === text(expected);
        case 'notEquals': return text(value) !== text(expected);
        case 'contains': return text(value).includes(text(expected));
        default: {
            const a = toNumber(value);
            const b = toNumber(expected);
            if (Number.isNaN(a) || Number.isNaN(b)) return false;
            switch (condition.operator) {
                case 'eq': return a === b;
                case 'neq': return a !== b;
                case 'gt': return a > b;
                case 'lt': return a < b;
                case 'gte': return a >= b;
                case 'lte': return a <= b;
                default: return false;
            }
        }
    }
}

/**
 * Evaluates a condition list where AND binds tighter than OR (`A or B and C` is `A or (B and C)`).
 * Conditions whose source is missing are dropped, not treated as false. Returns null when none remain.
 */
export function evaluateGroup(conditions: Condition[], read: SourceReader): boolean | null {
    const runs: Condition[][] = [];
    conditions.forEach((c, i) => {
        if (i === 0 || c.connector === 'or') runs.push([c]);
        else runs[runs.length - 1].push(c);
    });

    let any = false;
    let result = false;
    for (const run of runs) {
        const present = run.map((c) => ({ c, src: read(c.propertyKey) })).filter((x) => x.src.exists);
        if (present.length === 0) continue;
        any = true;
        if (present.every((x) => matches(x.c, x.src.value))) result = true;
    }
    return any ? result : null;
}

/**
 * Show empty (after dropping missing sources) means visible. Otherwise visible when Show matches.
 * A Hide match always wins.
 */
export function isVisible(rules: RuleSet, read: SourceReader): boolean {
    const show = evaluateGroup(rules.show, read);
    const hide = evaluateGroup(rules.hide, read);
    return (show ?? true) && !(hide ?? false);
}
