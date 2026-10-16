import { deepQuerySelectAll } from '../sharedLogic';

const MARK = 'data-cd-rules';

type DesignProperty = HTMLElement & { property?: { unique?: string } };

/**
 * Puts a red eye in the header of every property on the content type design view that has visibility
 * rules. The icon goes into the property's own `action-menu` slot as light DOM, so Umbraco's re-renders leave it alone.
 * Inherited properties don't render that slot, so they get no icon here.
 */
export class CdRuleIndicator {
    #root: () => HTMLElement | undefined;
    #hasRules: (propertyKey: string) => boolean;
    #timer = setInterval(() => this.#apply(), 500);

    constructor(root: () => HTMLElement | undefined, hasRules: (propertyKey: string) => boolean) {
        this.#root = root;
        this.#hasRules = hasRules;
    }

    // ponytail: polling, as the design view renders properties inside shadow roots and tabs that can't be observed from here.
    #apply() {
        const root = this.#root();
        if (!root) return;
        for (const el of deepQuerySelectAll('umb-content-type-design-editor-property', root) as DesignProperty[]) {
            const key = el.property?.unique;
            const icon = el.querySelector(`:scope > [${MARK}]`);
            const wanted = !!key && this.#hasRules(key);
            if (wanted && !icon) el.append(this.#create());
            else if (!wanted && icon) icon.remove();
        }
    }

    #create() {
        const icon = document.createElement('uui-icon');
        icon.setAttribute('slot', 'action-menu');
        icon.setAttribute('name', 'icon-eye');
        icon.setAttribute('title', 'Has visibility rules');
        icon.setAttribute(MARK, '');
        icon.style.color = 'var(--uui-color-danger)';
        return icon;
    }

    destroy() {
        clearInterval(this.#timer);
        for (const el of deepQuerySelectAll(`[${MARK}]`, this.#root() ?? document.body)) el.remove();
    }
}
