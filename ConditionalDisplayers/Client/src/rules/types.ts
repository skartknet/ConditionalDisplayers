export type Connector = 'and' | 'or';

export type Operator =
    | 'isTicked' | 'isNotTicked'
    | 'anyOf' | 'noneOf'
    | 'equals' | 'notEquals' | 'contains'
    | 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte'
    | 'isEmpty' | 'isNotEmpty';

export interface Condition {
    /** Property type key of the source property. */
    propertyKey: string;
    operator: Operator;
    /** Absent on the first condition of a group. */
    connector?: Connector;
    value?: unknown;
}

export interface RuleSet {
    show: Condition[];
    hide: Condition[];
}

/** One row as the management API returns it. */
export interface RuleRow {
    propertyTypeKey: string;
    contentTypeKey: string;
    rules: RuleSet;
}

/** One entry of the PUT body. Null rules deletes the row. */
export interface RuleUpdate {
    propertyTypeKey: string;
    rules: RuleSet | null;
}
