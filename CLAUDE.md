# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`Our.Umbraco.ConditionalDisplayers`: an Umbraco backoffice package (NuGet) providing property editors (checkbox, radio, dropdown) that show/hide other properties, groups and tabs on the same document/block. Targets Umbraco 17 (`net10.0`). Older Umbraco versions use earlier package versions (not in this branch).

## Commands

There are no tests and no linter. "Verification" = `tsc` passing in the client build, then manual testing in `TestWebV17`.

```sh
# Client (must be built before the .NET build/pack, output is not committed)
cd ConditionalDisplayers/Client
npm ci
npm run build      # tsc && vite build -> ../wwwroot/App_Plugins/ConditionalDisplayers/client.js
npm run watch      # rebuild on change while the test site runs

# .NET
dotnet build ConditionalDisplayers.sln
dotnet run --project TestWebV17          # test site, unattended install
dotnet pack ConditionalDisplayers/ConditionalDisplayers.csproj -c Release
```

Test site: `TestWebV17` references the RCL via `ProjectReference`, installs unattended (credentials in `TestWebV17/appsettings.json`), and uSync files under `TestWebV17/uSync/v17` recreate the CD data types, a doctype using them all, and a test page.

## Architecture

**Two halves:**
- `ConditionalDisplayers/Client/` (TypeScript + Lit + Vite): all the actual UI and show/hide behaviour. `@umbraco*` imports are externals, provided by the backoffice at runtime.
- `ConditionalDisplayers/*.cs`: the visibility rules API (`Rules/`) and package migrations. There is no value converter: migrated checkboxes use core `Umbraco.TrueFalse`.

**Client load chain:** `public/umbraco-package.json` registers a `bundle` pointing at `client.js` → `src/index.ts` exports a `backofficeEntryPoint` → `backoffice-entrypoint.ts` registers the manifests from `propertyeditors/manifest.ts`.

**Editor aliases are a contract.** `Our.Umbraco.CdCheckbox` (schema `Umbraco.TrueFalse`), `Our.Umbraco.CdRadio` and `Our.Umbraco.CdDropdownFlexible` (schema `Umbraco.Plain.String`) appear in the client manifest, the migrations and saved data types in existing sites. Renaming any of them breaks installs. `Our.Umbraco.CdMultivalues` is an internal settings UI (the prevalue list editor for radio/dropdown, `components/cdMultivalues.ts`).

**Settings definitions** live in `manifest.ts` as `cd*PropertyInfo` objects; editors read config via `config.getValueByAlias(cd*PropertyInfo.x.alias)`, so add a setting there first.

**Show/hide mechanism (the non-obvious bit):**
- `abstractions/CdElement.ts` is the base class for all three editors. It waits for *both* `firstUpdated` and `UMB_PROPERTY_DATASET_CONTEXT` before calling `initDefaults()` then `bootstrap()` once. Subclasses implement `initDefaults`, `bootstrap`, `runDisplayLogic` and call `displayProps(showAliases, hideAliases)`.
- **Properties** (`alias` / `property:alias`) are hidden via Umbraco's `propertyViewGuard` on the dataset's data owner (document/media/member workspace, or block element manager), reached through the protected `_dataOwner` of the property dataset context. The guard applies to tabs that aren't rendered yet (Umbraco only renders the active tab via `umb-router-slot`), which DOM hiding can't do. Rules are keyed `our-conditionaldisplayers:<alias>:<variant>`, one per target, so the last editor to act wins; a `permitted: false` rule beats any allow rule. If `_dataOwner` is missing, properties fall back to DOM hiding.
- **Tabs and groups** still use DOM hiding: `sharedLogic.ts` → `toggleElements` walks the dataset host element *through open shadow roots* (`deepQuerySelectAll`) and sets `style.display = 'none'` directly. It relies on Umbraco's `data-mark` attributes:
  - `alias` / `property:alias` (fallback only) → `umb-property[data-mark="property:alias"]`
  - `group:alias` → `umb-block-workspace-view-edit-properties[data-mark="property-group:alias"]`, hiding its closest `uui-box`
  - `tab:alias` → `uui-tab[data-mark="content-tab:tab/alias"]`, hiding the `#button` inside its shadow root
  Changes in Umbraco's backoffice markup/`data-mark` values are the most likely cause of breakage after an Umbraco upgrade.
- Hidden properties still validate (documented limitation).
- When re-showing, `uui-textarea[auto-height]` must be re-measured (`refreshAutoHeightTextareas`) or it stays collapsed at ~2px.

**Migrations** (`Migrations/MigrationPlan.cs`, `PackageMigrationPlan`): register the package entry, then fix data types migrated from the AngularJS-era package (setting correct `EditorAlias` for each `EditorUiAlias`). Add new steps by appending `.To<NewStep>(NewStep.State)`; never reorder or rename existing state strings.
- `MigrateDataTypes` is registered for two states (`LegacyState` and `State`). Both shipped in 16.x as separate classes, so sites can sit at either, and the plan needs both. It restores `EditorUiAlias` from Umbraco's `migrateDataEditorSplitCollectionData` key-value entry, then sets `EditorAlias`. Idempotent.
- Data types are updated through `DataTypeDto` rather than `IDataTypeService`: the legacy rows have editor aliases that no longer resolve, and the service would raise notifications and cache refreshes mid-upgrade. Keep new steps on the DTO route.

## Versioning and release

- Version lives in `ConditionalDisplayers.csproj` `<Version>` (used by CI). `Client/package.json` and `Client/public/umbraco-package.json` also carry a version; keep them in step when bumping.
- Pushing to a `release/**` branch triggers `.github/workflows/release.yml`: builds client, packs, pushes to NuGet and tags `v<version>` (versions with a `-suffix` are marked pre-release). PRs run `build.yml`.
- PRs target `master`.
- NuGet readme is `README.nuget.md`; marketplace content is `umbraco-marketplace*.{json,md}`; user docs are in `Documentation/`.
