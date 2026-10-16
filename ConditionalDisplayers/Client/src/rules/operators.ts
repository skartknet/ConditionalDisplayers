import type { Operator } from './types';

const TICK: Operator[] = ['isTicked', 'isNotTicked'];
const LIST: Operator[] = ['anyOf', 'noneOf'];
const TEXT: Operator[] = ['equals', 'notEquals', 'contains', 'isEmpty', 'isNotEmpty'];
const NUMBER: Operator[] = ['eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'isEmpty', 'isNotEmpty'];
const EMPTY: Operator[] = ['isEmpty', 'isNotEmpty'];

export type OperatorInput = 'none' | 'list' | 'text' | 'number';

const LIST_SCHEMAS = new Set([
    'Umbraco.DropDown.Flexible',
    'Umbraco.RadioButtonList',
    'Umbraco.CheckBoxList',
]);

/**
 * Our own CdRadio and CdDropdownFlexible editors use the `Umbraco.Plain.String` schema, so the
 * schema alias alone can't identify them. They hold a single configured item key.
 */
const CD_LIST_EDITORS = new Set(['Our.Umbraco.CdRadio', 'Our.Umbraco.CdDropdownFlexible']);

/** Operators offered for a source, by the data type's schema alias (and editor alias for our own list editors). */
export function operatorsFor(schemaAlias: string | undefined, editorAlias?: string): Operator[] {
    if (editorAlias && CD_LIST_EDITORS.has(editorAlias)) return LIST;
    switch (schemaAlias) {
        case 'Umbraco.TrueFalse': return TICK;
        case 'Umbraco.TextBox':
        case 'Umbraco.TextArea': return TEXT;
        case 'Umbraco.Integer':
        case 'Umbraco.Decimal': return NUMBER;
        default: return schemaAlias && LIST_SCHEMAS.has(schemaAlias) ? LIST : EMPTY;
    }
}

export function inputFor(operator: Operator): OperatorInput {
    switch (operator) {
        case 'anyOf':
        case 'noneOf': return 'list';
        case 'equals':
        case 'notEquals':
        case 'contains': return 'text';
        case 'eq': case 'neq': case 'gt': case 'lt': case 'gte': case 'lte': return 'number';
        default: return 'none';
    }
}
