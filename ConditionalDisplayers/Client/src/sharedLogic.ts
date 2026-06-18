export const toggleElements = (aliases: string, isShow: boolean, hostElement: HTMLElement) => {
    if (!aliases) {
        return;
    }

    //Elements to hide
    const aliasList = aliases.split(',');

    if (aliasList && aliasList.length > 0) {
        const cssSelector = elSelectors(aliasList);
        const elements = deepQuerySelectAll(cssSelector, hostElement, false);
        elements.forEach((el) => {
            const tagName = el.tagName.toLowerCase();

            //hiding tabs - we hide the buttons that makes the tab
            if (tagName === 'uui-tab') {
                const button = el.shadowRoot?.querySelector('#button') as HTMLElement | null;
                if (!button) {
                    return;
                }
                if (isShow) {
                    button.style.removeProperty('display');
                } else {
                    button.style.display = 'none';
                }
                return;
            }
            //Hiding property groups
            const target = (tagName === 'umb-block-workspace-view-edit-properties'
                ? (el.closest('uui-box') as HTMLElement | null)
                : el) ?? el;

            if (isShow) {
                target.style.removeProperty('display');
            } else {
                target.style.display = 'none';
            }
            // TODO: update css to animate?
        });
    }
}

const elSelectors = (aliasList: string[]): string => {
    let cssSelector = "";

    for (let i = 0; i < aliasList.length; i++) {
        if (cssSelector !== "") {
            cssSelector += ",";
        }
        const alias = aliasList[i].trim();
        //Alias starting with group for groups
        if (alias.startsWith("group:")) {
            const groupAlias = alias.substring(6);
            cssSelector += `umb-block-workspace-view-edit-properties[data-mark="property-group:${groupAlias}"]`;
        //Alias starting with tab for tabs
        } else if (alias.startsWith("tab:")) {
            const tabAlias = alias.substring(4);
            cssSelector += `uui-tab[data-mark="content-tab:tab/${tabAlias}"]`;
        //Default alias for other properties
        } else {
            const propAlias = alias.startsWith("property:") ? alias.substring(9) : alias;
            cssSelector += `umb-property[data-mark="property:${propAlias}"]`;
        }
    }
    return cssSelector;
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