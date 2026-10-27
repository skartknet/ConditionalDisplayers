import { describe, expect, it } from 'vitest';
import { emptyContainers, type ContainerInfo } from './containers';

const tab = (id: string, name: string): ContainerInfo => ({ id, name, type: 'Tab', parent: null });
const group = (id: string, name: string, parent: string | null): ContainerInfo => ({ id, name, type: 'Group', parent: parent ? { id: parent } : null });
const prop = (unique: string, container: string | null) => ({ unique, container: container ? { id: container } : null });

const containers = [tab('t1', 'Content'), group('g1', 'SEO', 't1'), group('g2', 'Body', 't1'), tab('t2', 'Extras'), group('g3', 'Misc', 't2')];
const properties = [prop('a', 'g1'), prop('b', 'g1'), prop('c', 'g2'), prop('d', 'g3')];

describe('emptyContainers', () => {
    it('hides nothing when something in each container is visible', () => {
        expect(emptyContainers(containers, properties, new Set(['a']))).toEqual({ tabNames: [], groupIds: [] });
    });

    it('hides a group when all its properties are hidden, but not its tab', () => {
        expect(emptyContainers(containers, properties, new Set(['a', 'b']))).toEqual({ tabNames: [], groupIds: ['g1'] });
    });

    it('hides a tab when every group in it is hidden', () => {
        const r = emptyContainers(containers, properties, new Set(['a', 'b', 'c']));
        expect(r.tabNames).toEqual(['Content']);
        expect(r.groupIds.sort()).toEqual(['g1', 'g2']);
    });

    it('treats containers with the same name and parent from compositions as one', () => {
        const merged = [...containers, tab('t1c', 'Content'), group('g1c', 'SEO', 't1c')];
        const props = [...properties, prop('e', 'g1c')];
        // 'e' is still visible, so the merged SEO group stays.
        expect(emptyContainers(merged, props, new Set(['a', 'b'])).groupIds).toEqual([]);
        expect(emptyContainers(merged, props, new Set(['a', 'b', 'e'])).groupIds.sort()).toEqual(['g1', 'g1c']);
    });

    it('ignores containers with no properties and root-level properties', () => {
        expect(emptyContainers([...containers, tab('t3', 'Empty')], [...properties, prop('r', null)], new Set(['r']))).toEqual({ tabNames: [], groupIds: [] });
    });

    it('counts a property placed directly on a tab', () => {
        expect(emptyContainers([tab('t', 'Solo')], [prop('x', 't')], new Set(['x']))).toEqual({ tabNames: ['Solo'], groupIds: [] });
    });
});
