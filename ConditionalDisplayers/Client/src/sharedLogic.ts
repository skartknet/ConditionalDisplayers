/**
 * uui-textarea measures its auto height when connected. If that happens while hidden (display: none)
 * it collapses to ~2px and never recovers, so re-measure once the element is visible again.
 */
export const refreshAutoHeightTextareas = (container: HTMLElement) => {
    requestAnimationFrame(() => {
        deepQuerySelectAll('uui-textarea[auto-height]', container, false).forEach((textarea) => {
            (textarea as HTMLElement & { autoUpdateHeight?: () => void }).autoUpdateHeight?.();
        });
    });
}

/**
 * Searches through all decendent elements of {@link rootNode} to find any elements matching {@link selector}.
 * @remarks non-elegant solution, relies on all decendent nodes to be set as 'open' (in Umbraco they are)
 */
export const deepQuerySelectAll = (selector: string, rootNode: HTMLElement = document.body, isSingleMatch: boolean = false): HTMLElement[] => {
    const arr : Array<Element> = [];

    const nodeLookup = (node: Element) => {
        // only element nodes
        if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        // add if matching selector
        if (node.matches(selector)) {
            arr.push(node);
            if (isSingleMatch) {
                return;
            }
        }

        // loop through the children
        const children = node.children;
        if (children.length) {
            for (const child of children) {
                nodeLookup(child);
            }
        }

        // detect shadowRoot and loop through children
        const shadowRoot = node.shadowRoot;
        if (shadowRoot) {
            const shadowChildren = shadowRoot.children;
            for (const shadowChild of shadowChildren) {
                nodeLookup(shadowChild);
            }
        }
    }

    nodeLookup(rootNode);

    return (isSingleMatch ? arr.slice(0, 1) : arr) as Array<HTMLElement>;
}