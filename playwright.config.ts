import { defineConfig } from '@playwright/test';

const baseURL = process.env.CD_BASE_URL ?? 'https://localhost:44344';

// UI tests run against TestWebV17. Start it with `dotnet run --project TestWebV17` (or let this config do it).
export default defineConfig({
    testDir: 'tests/e2e',
    workers: 1, // tests share one database and edit the same doc type
    timeout: 90_000,
    reporter: [['list']],
    use: {
        baseURL,
        ignoreHTTPSErrors: true,
        // Uses the installed Edge/Chrome so no browser download is needed. Override with CD_BROWSER_CHANNEL.
        channel: process.env.CD_BROWSER_CHANNEL ?? 'msedge',
        testIdAttribute: 'data-testid',
        trace: 'retain-on-failure',
    },
    projects: [
        { name: 'setup', testMatch: /auth\.setup\.ts/ },
        { name: 'e2e', testMatch: /.*\.spec\.ts/, dependencies: ['setup'], use: { storageState: 'tests/e2e/.auth/state.json' } },
    ],
    webServer: {
        command: 'dotnet run --project TestWebV17',
        url: `${baseURL}/umbraco/management/api/v1/server/status`,
        ignoreHTTPSErrors: true,
        reuseExistingServer: true,
        timeout: 180_000,
    },
});
