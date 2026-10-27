import { css, html, customElement, state, nothing } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UMB_CONTENT_TYPE_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/content-type';
import { UMB_PROPERTY_TYPE_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/property-type';
import { UMB_MODAL_CONTEXT } from '@umbraco-cms/backoffice/modal';
import { UmbDataTypeDetailRepository } from '@umbraco-cms/backoffice/data-type';
import { fetchRules } from '../rules/api';
import { inputFor, operatorsFor } from '../rules/operators';
import type { Condition, Connector, Operator, RuleSet } from '../rules/types';
import { CD_STAGING_CONTEXT, type CdStagingContext } from './staging.context';

type Source = { unique: string; alias: string; name: string; dataType?: { unique: string } };
type Item = { key: string; label: string };
type SourceInfo = { operators: Operator[]; items: Item[] };
type GroupName = 'show' | 'hide';

const OPERATOR_LABELS: Record<Operator, string> = {
    isTicked: 'is ticked', isNotTicked: 'is not ticked',
    anyOf: 'is any of', noneOf: 'is none of',
    equals: 'equals', notEquals: 'does not equal', contains: 'contains',
    eq: '=', neq: '≠', gt: '>', lt: '<', gte: '≥', lte: '≤',
    isEmpty: 'is empty', isNotEmpty: 'is not empty',
};

/** Items configured on a list data type. Our own editors store { key, value: label }, core editors store strings or { value, name }. */
function readItems(values: Array<{ alias: string; value: unknown }> | undefined): Item[] {
    const raw = values?.find((v) => v.alias === 'items')?.value;
    if (!Array.isArray(raw)) return [];
    return raw.map((i: unknown) => {
        if (typeof i === 'string') return { key: i, label: i };
        const o = i as Record<string, unknown>;
        const key = String(o.key ?? o.value ?? o.name ?? '');
        return { key, label: String(o.key !== undefined ? (o.value ?? o.key) : (o.name ?? o.value ?? '')) };
    }).filter((i) => i.key);
}

const emptyRules = (): RuleSet => ({ show: [], hide: [] });

@customElement('our-cd-visibility-view')
export class CdVisibilityViewElement extends UmbLitElement {
    #staging?: CdStagingContext;
    #propertyKey?: string;
    #loaded = false;
    #repo = new UmbDataTypeDetailRepository(this);
    #info = new Map<string, Promise<SourceInfo>>();

    @state() private _rules: RuleSet = emptyRules();
    @state() private _sources: Source[] = [];
    @state() private _infos: Record<string, SourceInfo> = {};
    @state() private _mandatory = false;
    @state() private _ready = false;

    constructor() {
        super();
        this.consumeContext(CD_STAGING_CONTEXT, (staging) => {
            this.#staging = staging;
            this.#load();
        });
        this.consumeContext(UMB_MODAL_CONTEXT, (modal) => {
            this.#modal = modal;
            this.#load();
        });
        this.consumeContext(UMB_PROPERTY_TYPE_WORKSPACE_CONTEXT, (ctx) => {
            this.observe(ctx?.data, (data) => {
                this._mandatory = !!data?.validation?.mandatory;
                if (data?.unique && data.unique !== this.#propertyKey) {
                    this.#propertyKey = data.unique;
                    this.#load();
                }
            }, 'cdPropertyData');
        });
        this.consumeContext(UMB_CONTENT_TYPE_WORKSPACE_CONTEXT, (ws) => {
            this.#ws = ws;
            this.observe(ws?.structure.contentTypeProperties, (props) => {
                this._sources = (props as Source[]) ?? [];
                this._sources.forEach((s) => this.#loadInfo(s));
            }, 'cdSources');
            this.#load();
        }).passContextAliasMatches();
    }

    #modal?: { onSubmit(): Promise<unknown> };
    #ws?: { structure: { contentTypeUniques: import('@umbraco-cms/backoffice/observable-api').Observable<string[]>; getOwnerContentTypeUnique?(): string | undefined } };

    async #load() {
        if (this.#loaded || !this.#staging || !this.#propertyKey || !this.#ws || !this.#modal) return;
        this.#loaded = true;
        this.#staging.track(this.#propertyKey, this.#modal.onSubmit());

        const staged = this.#staging.get(this.#propertyKey);
        if (staged !== undefined) {
            this._rules = staged ?? emptyRules();
            this._ready = true;
            return;
        }
        const uniques = await new Promise<string[]>((resolve) => {
            const sub = this.#ws!.structure.contentTypeUniques.subscribe((u) => {
                if (u.length) { resolve(u); queueMicrotask(() => sub.unsubscribe()); }
            });
        });
        const rows = await fetchRules(this, uniques);
        const row = rows.find((r) => r.propertyTypeKey === this.#propertyKey);
        this._rules = row ? { show: row.rules.show ?? [], hide: row.rules.hide ?? [] } : emptyRules();
        this._ready = true;
    }

    #loadInfo(source: Source) {
        if (this.#info.has(source.unique) || !source.dataType) return;
        const p = this.#repo.requestByUnique(source.dataType.unique).then(({ data }) => {
            const editorUi = data?.editorUiAlias ?? undefined;
            const info: SourceInfo = {
                operators: operatorsFor(data?.editorAlias, editorUi),
                items: readItems(data?.values as Array<{ alias: string; value: unknown }> | undefined),
            };
            this._infos = { ...this._infos, [source.unique]: info };
            return info;
        });
        this.#info.set(source.unique, p);
    }

    get #candidates(): Source[] {
        return this._sources.filter((s) => s.unique !== this.#propertyKey);
    }

    #update(group: GroupName, next: Condition[]) {
        // The first condition never carries a connector.
        const fixed = next.map((c, i) => {
            const { connector, ...rest } = c;
            return i === 0 ? rest : { ...rest, connector: connector ?? 'and' };
        });
        this._rules = { ...this._rules, [group]: fixed };
        if (!this.#propertyKey) return;
        const empty = !this._rules.show.length && !this._rules.hide.length;
        this.#staging?.setDraft(this.#propertyKey, empty ? null : this._rules);
    }

    #add(group: GroupName) {
        const source = this.#candidates.find((s) => this._infos[s.unique]);
        if (!source) return;
        const operator = this._infos[source.unique].operators[0];
        this.#update(group, [...this._rules[group], { propertyKey: source.unique, operator, connector: 'and' }]);
    }

    #patch(group: GroupName, index: number, patch: Partial<Condition>) {
        this.#update(group, this._rules[group].map((c, i) => (i === index ? { ...c, ...patch } : c)));
    }

    #remove(group: GroupName, index: number) {
        this.#update(group, this._rules[group].filter((_, i) => i !== index));
    }

    #setSource(group: GroupName, index: number, propertyKey: string) {
        const operator = this._infos[propertyKey]?.operators[0] ?? 'isEmpty';
        this.#patch(group, index, { propertyKey, operator, value: undefined });
    }

    #setOperator(group: GroupName, index: number, operator: Operator) {
        const old = this._rules[group][index];
        const sameInput = inputFor(old.operator) === inputFor(operator);
        this.#patch(group, index, { operator, value: sameInput ? old.value : undefined });
    }

    #toggleItem(group: GroupName, index: number, key: string, on: boolean) {
        const current = (this._rules[group][index].value as string[] | undefined) ?? [];
        this.#patch(group, index, { value: on ? [...current, key] : current.filter((k) => k !== key) });
    }

    #value(group: GroupName, c: Condition, index: number, info?: SourceInfo) {
        switch (inputFor(c.operator)) {
            case 'list': {
                const selected = (c.value as string[] | undefined) ?? [];
                return html`<div class="items">${(info?.items ?? []).map((item) => html`
                    <uui-checkbox label=${item.label} ?checked=${selected.includes(item.key)}
                        @change=${(e: Event) => this.#toggleItem(group, index, item.key, (e.target as HTMLInputElement).checked)}></uui-checkbox>`)}
                </div>`;
            }
            case 'text':
            case 'number':
                return html`<uui-input label="Value" .type=${inputFor(c.operator) === 'number' ? 'number' : 'text'}
                    .value=${String(c.value ?? '')}
                    @input=${(e: Event) => this.#patch(group, index, { value: (e.target as HTMLInputElement).value })}></uui-input>`;
            default:
                return nothing;
        }
    }

    #renderGroup(group: GroupName, title: string, help: string) {
        const conditions = this._rules[group];
        // AND binds tighter than OR, so an 'or' connector starts a new run.
        const runs: Array<Array<{ c: Condition; i: number }>> = [];
        conditions.forEach((c, i) => {
            if (i === 0 || c.connector === 'or') runs.push([{ c, i }]);
            else runs[runs.length - 1].push({ c, i });
        });

        return html`
            <uui-box headline=${title} data-testid="group-${group}">
                <p class="help">${help}</p>
                ${group === 'show' && conditions.length === 0
                    ? html`<p class="placeholder" data-testid="on-page-load">On page load: always visible</p>`
                    : nothing}
                ${runs.map((run) => html`<div class="run">${run.map(({ c, i }) => this.#renderRow(group, c, i))}</div>`)}
                <uui-button look="placeholder" label="Add condition" data-testid="add-${group}"
                    @click=${() => this.#add(group)}>Add condition</uui-button>
            </uui-box>`;
    }

    #renderRow(group: GroupName, c: Condition, i: number) {
        const source = this._sources.find((s) => s.unique === c.propertyKey);
        const info = this._infos[c.propertyKey];
        const operators = info?.operators ?? [];
        return html`
            ${i > 0 ? html`<uui-select class="connector" label="Connector" data-testid="connector"
                .options=${(['and', 'or'] as Connector[]).map((v) => ({ name: v.toUpperCase(), value: v, selected: (c.connector ?? 'and') === v }))}
                @change=${(e: Event) => this.#patch(group, i, { connector: (e.target as HTMLSelectElement).value as Connector })}></uui-select>` : nothing}
            <div class="row" data-testid="condition">
                ${source ? nothing : html`<uui-tag color="danger" look="primary">Deleted property, ignored</uui-tag>`}
                <uui-select label="Property" data-testid="source"
                    .options=${[
                        ...(source ? [] : [{ name: '(missing)', value: c.propertyKey, selected: true }]),
                        ...this.#candidates.map((s) => ({ name: s.name, value: s.unique, selected: s.unique === c.propertyKey })),
                    ]}
                    @change=${(e: Event) => this.#setSource(group, i, (e.target as HTMLSelectElement).value)}></uui-select>
                <uui-select label="Operator" data-testid="operator"
                    .options=${operators.map((o) => ({ name: OPERATOR_LABELS[o], value: o, selected: o === c.operator }))}
                    @change=${(e: Event) => this.#setOperator(group, i, (e.target as HTMLSelectElement).value as Operator)}></uui-select>
                ${this.#value(group, c, i, info)}
                <uui-button compact look="secondary" color="danger" label="Remove condition" @click=${() => this.#remove(group, i)}>
                    <uui-icon name="icon-trash"></uui-icon>
                </uui-button>
            </div>`;
    }

    override render() {
        return html`
            ${this._mandatory ? html`<uui-box data-testid="mandatory-notice">
                <p>Visibility rules are switched off while this property is mandatory. Any saved rules are kept, and apply again once 'Mandatory' is unticked.</p>
            </uui-box>` : nothing}
            <div class=${this._mandatory ? 'readonly' : ''} ?inert=${this._mandatory} data-ready=${this._ready}>
                ${this.#renderGroup('show', 'Show', 'Visible only when these conditions match. Leave empty to always show.')}
                ${this.#renderGroup('hide', 'Hide', 'Hidden when these conditions match. Hide wins over Show.')}
            </div>`;
    }

    static override styles = [
        UmbTextStyles,
        css`
            :host { display: block; padding: var(--uui-size-layout-1); }
            uui-box { margin-bottom: var(--uui-size-layout-1); }
            .help, .placeholder { color: var(--uui-color-text-alt); margin-top: 0; }
            .run { border-left: 3px solid var(--uui-color-border-emphasis); padding-left: var(--uui-size-space-4); margin-bottom: var(--uui-size-space-3); }
            .row { display: flex; flex-wrap: wrap; gap: var(--uui-size-space-3); align-items: center; margin-bottom: var(--uui-size-space-3); }
            .connector { width: 90px; margin-bottom: var(--uui-size-space-3); }
            .items { display: flex; flex-wrap: wrap; gap: var(--uui-size-space-3); }
            .readonly { opacity: 0.5; }
        `,
    ];
}

export default CdVisibilityViewElement;

declare global {
    interface HTMLElementTagNameMap {
        'our-cd-visibility-view': CdVisibilityViewElement;
    }
}
