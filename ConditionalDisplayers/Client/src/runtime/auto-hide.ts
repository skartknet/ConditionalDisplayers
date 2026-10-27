import { deepQuerySelectAll, refreshAutoHeightTextareas } from '../sharedLogic';
import type { EmptyContainers } from './containers';

const encodeTabName = (name: string) => encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'));

/**
 * Hides the DOM of groups and tabs that have no visible properties. Umbraco only renders the active tab,
 * so the targets are worked out from the structure (see emptyContainers) and applied to whatever is rendered.
 */
export class CdContainerHider {
    #root: () => HTMLElement;
    #empty: EmptyContainers = { tabNames: [], groupIds: [] };
    #hidden = new Set<HTMLElement>();
    #timer?: ReturnType<typeof setInterval>;

    constructor(root: () => HTMLElement) {
        this.#root = root;
    }

    set(empty: EmptyContainers) {
        this.#empty = empty;
        this.#apply();
        const needed = empty.tabNames.length > 0 || empty.groupIds.length > 0;
        // ponytail: polling, as switching tabs renders new elements inside shadow roots that can't be observed from here. Replace with a hook if Umbraco exposes container guards.
        if (needed && !this.#timer) this.#timer = setInterval(() => this.#apply(), 500);
        if (!needed && this.#timer) this.stop();
    }

    #apply() {
        const root = this.#root();
        const wanted = new Set<HTMLElement>();

        if (this.#empty.groupIds.length) {
            const ids = new Set(this.#empty.groupIds);
            deepQuerySelectAll('umb-content-workspace-view-edit-properties, umb-block-workspace-view-edit-properties', root).forEach((el) => {
                const id = (el as HTMLElement & { containerId?: string | null }).containerId;
                const box = id && ids.has(id) ? (el.closest('uui-box') as HTMLElement | null) : null;
                if (box) wanted.add(box);
            });
        }

        if (this.#empty.tabNames.length) {
            const suffixes = this.#empty.tabNames.map((n) => `/tab/${encodeTabName(n)}`);
            deepQuerySelectAll('uui-tab', root).forEach((el) => {
                const href = (el as HTMLElement & { href?: string }).href ?? '';
                // The tab group rewrites each tab's own display for overflow, so hide the button inside it.
                const button = el.shadowRoot?.querySelector<HTMLElement>('#button');
                if (button && suffixes.some((s) => href.endsWith(s))) wanted.add(button);
            });
        }

        for (const el of this.#hidden) {
            if (wanted.has(el)) continue;
            el.style.removeProperty('display');
            refreshAutoHeightTextareas(el);
        }
        wanted.forEach((el) => (el.style.display = 'none'));
        this.#hidden = wanted;
    }

    stop() {
        clearInterval(this.#timer);
        this.#timer = undefined;
    }

    destroy() {
        this.stop();
        this.#empty = { tabNames: [], groupIds: [] };
        this.#apply();
    }
}
