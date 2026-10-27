import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { umbHttpClient } from '@umbraco-cms/backoffice/http-client';
import { tryExecute } from '@umbraco-cms/backoffice/resources';
import type { RuleRow, RuleUpdate } from './types';

const url = '/umbraco/management/api/v1/conditionaldisplayers/rules';
const security = [{ scheme: 'bearer', type: 'http' }] as [{ scheme: 'bearer'; type: 'http' }];

// ponytail: no TTL. Rules only change through the content type workspace, which calls invalidateRules() after a flush.
const cache = new Map<string, Promise<RuleRow[]>>();

export function invalidateRules() {
    cache.clear();
}

/** Rows for the given owner and composition keys. Failures resolve to no rules, so a bad request never hides properties. */
export function fetchRules(host: UmbControllerHost, contentTypeKeys: string[]): Promise<RuleRow[]> {
    if (contentTypeKeys.length === 0) return Promise.resolve([]);
    const cacheKey = [...contentTypeKeys].sort().join(',');
    let rows = cache.get(cacheKey);
    if (!rows) {
        rows = tryExecute(
            host,
            umbHttpClient.get<RuleRow[]>({ url, security, query: { contentTypeKey: contentTypeKeys } }),
        ).then(({ data }) => (Array.isArray(data) ? (data as RuleRow[]) : []));
        cache.set(cacheKey, rows);
    }
    return rows;
}

/** Upserts rules per property. Resolves true on success. */
export async function saveRules(host: UmbControllerHost, contentTypeKey: string, updates: RuleUpdate[]): Promise<boolean> {
    const { error } = await tryExecute(
        host,
        umbHttpClient.put({
            url: `${url}/${contentTypeKey}`,
            security,
            body: updates,
            headers: { 'Content-Type': 'application/json' },
        }),
    );
    if (!error) invalidateRules();
    return !error;
}
