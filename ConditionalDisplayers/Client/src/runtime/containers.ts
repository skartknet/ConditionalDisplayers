export type ContainerInfo = { id: string; name: string | null; type: 'Tab' | 'Group'; parent: { id: string } | null };
export type PropertyContainerInfo = { unique: string; container?: { id: string } | null };

export type EmptyContainers = {
    /** Names of tabs whose properties are all hidden. */
    tabNames: string[];
    /** Ids of every container (own and from compositions) that makes up a group whose properties are all hidden. */
    groupIds: string[];
};

/**
 * Finds tabs and groups whose properties are all in `hidden`. Containers that merge across compositions
 * (same name under the same parent) count as one. Containers without properties are left alone.
 */
export function emptyContainers(containers: ContainerInfo[], properties: PropertyContainerInfo[], hidden: Set<string>): EmptyContainers {
    const byId = new Map(containers.map((c) => [c.id, c]));
    type Node = { type: 'Tab' | 'Group'; name: string; ids: Set<string>; total: number; hidden: number };
    const nodes = new Map<string, Node>();

    const pathOf = (c: ContainerInfo) => {
        const names: string[] = [];
        for (let cur: ContainerInfo | undefined = c; cur; cur = cur.parent ? byId.get(cur.parent.id) : undefined) {
            names.unshift(`${cur.type}:${cur.name ?? ''}`);
        }
        return names.join('/');
    };

    for (const p of properties) {
        // The property counts towards its container and every ancestor (the group, then its tab).
        for (let c = p.container ? byId.get(p.container.id) : undefined; c; c = c.parent ? byId.get(c.parent.id) : undefined) {
            const key = pathOf(c);
            const node = nodes.get(key) ?? { type: c.type, name: c.name ?? '', ids: new Set<string>(), total: 0, hidden: 0 };
            node.ids.add(c.id);
            node.total++;
            if (hidden.has(p.unique)) node.hidden++;
            nodes.set(key, node);
        }
    }

    const result: EmptyContainers = { tabNames: [], groupIds: [] };
    for (const n of nodes.values()) {
        if (n.total === 0 || n.hidden !== n.total) continue;
        if (n.type === 'Tab') result.tabNames.push(n.name);
        else result.groupIds.push(...n.ids);
    }
    return result;
}
