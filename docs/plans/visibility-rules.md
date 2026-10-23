# Visibility rules: plan

Replace the 'controller editor' model (CD checkbox, radio and dropdown editors that show or hide other properties) with visibility rules configured on each property in the 'Edit property' modal.

Target release: `17.0.0-beta2`, then `17.0.0`. Supports Umbraco 17 (`net10.0`) only. The major bump signals a breaking, one-way migration, not an Umbraco version. Update the README compatibility table to say so.

## Decisions

| # | Topic | Decision |
|---|---|---|
| 1 | UI placement | New 'Visibility' tab in the 'Edit property' modal: a `workspaceView` conditioned on `Umb.Workspace.PropertyType`. Core's settings view has no extension slot, so no inline box. Works for element types too. |
| 2 | Storage | Own DB table plus management API. Keyed by property type key (GUID), not alias. |
| 3 | Save timing | Stage edits client-side per doc type workspace, flush on successful doc type save, drop on discard. |
| 4/5 | Groups and default state | Two groups, **Show** and **Hide**. No 'Hide on load' setting. Show empty means always visible (UI shows a read-only 'On page load' placeholder). Show has conditions means hidden by default, shown when they match. Hide match means hidden. **Hide wins.** |
| 6/7 | Combining conditions | Each condition after the first has an AND/OR dropdown (default AND). AND binds tighter than OR: `A OR B AND C` = `A OR (B AND C)`. UI visually groups AND-runs. No nesting. |
| 8 | Sources and operators | Any property on the same content type (including inherited and compositions), excluding itself. Typed operators by schema alias (table below). |
| 9 | Variants | Evaluate per workspace pane against its own dataset. Variant source uses that pane's culture/segment value; invariant source uses the shared value. |
| 10/11 | Mandatory | Rules are disabled while the property is Mandatory. Tab shows a notice and goes read-only; stored rules are kept but ignored at runtime until Mandatory is unticked. Regex is not restricted. |
| 12 | Blocks | Same element only. Content properties reference content properties; settings reference settings. Each block instance evaluates independently. |
| 13/14 | Existing editors | `CdCheckbox` data types are swapped to core `Umbraco.TrueFalse` (identical value). `CdRadio` and `CdDropdownFlexible` stay as plain key/label list editors with all show/hide logic and settings removed. Aliases unchanged. No content value rewrites. |
| 15 | Tabs and groups | Migration expands `tab:`/`group:` targets into rules on every property in that container. Runtime auto-hides a group when all its properties are hidden, and a tab when all its contents are hidden. No explicit container rules. |
| 16 | Hidden values | Untouched. Saved and published as normal. Documented. |
| 17 | Release | `17.0.0-beta2` first. |
| 18 | Hidden sources | Conditions read values regardless of the source's visibility. Rules never depend on other rules, so there are no cycles and evaluation is a single flat pass. |

### Operators

| Source schema alias | Operators | Value input |
|---|---|---|
| `Umbraco.TrueFalse` | is ticked, is not ticked | none |
| `Umbraco.DropDown.Flexible`, `Umbraco.RadioButtonList`, `Umbraco.CheckBoxList` | is any of, is none of | multi-select from the data type's configured items |
| `Umbraco.TextBox`, `Umbraco.TextArea` | equals, does not equal, contains, is empty, is not empty | text |
| `Umbraco.Integer`, `Umbraco.Decimal` | =, ≠, >, <, ≥, ≤, is empty, is not empty | number |
| Anything else | is empty, is not empty | none |

The `Our.Umbraco.CdRadio` and `Our.Umbraco.CdDropdownFlexible` editors (schema `Umbraco.Plain.String`) must be treated as list sources: 'is any of / is none of' over their configured item keys, showing item labels in the picker.

## Research findings

Verified by reading `@umbraco-cms/backoffice` 16.1.0 (installed in `Client/node_modules`) and the `release-16.5.1` and `release-17.7.1` tags of `umbraco/Umbraco-CMS`. Details are in the sections below.

### Client

| Finding | Consequence |
|---|---|
| The 'Edit property' modal is the `Umb.Workspace.PropertyType` workspace with a single view; Validation and Appearance are hard-coded in one `uui-box` with no slot. | Visibility is a second `workspaceView` (tab). |
| `UmbPropertyTypeModel` has fixed fields, and `visibility` is already taken (member type `memberCanEdit`/`memberCanView`). | Own storage; avoid the name `visibility` in our types. |
| The content type workspace's `_create`/`_update` catch and log errors, so the `requestSubmit` promise resolves even when the save fails. | Don't flush on the submit promise. |
| `persistedData` is a `UmbDeepState`, which skips emitting when the new value is JSON-equal to the old one (`libs/observable-api/states/deep-state.js:39`). A save that changes only rules leaves the doc type identical, so it never emits. | **Can't be the flush trigger.** |
| After `structure.save()` succeeds, `_update` always dispatches `UmbRequestReloadStructureForEntityEvent` with the workspace's `unique` on `UMB_ACTION_EVENT_CONTEXT` (17.7.1 also dispatches `UmbEntityUpdatedEvent`). After `structure.create()` succeeds, `_create` calls `setIsNew(false)`. Neither runs on failure. Same in 16.1.0 and 17.7.1. | Flush trigger: the update event for our `unique`, or `isNew` flipping from `true` to `false`. |
| The property type workspace consumes `UMB_CONTENT_TYPE_WORKSPACE_CONTEXT` from inside the modal. | Our staging `workspaceContext` on the doc type workspace is reachable from the Visibility tab. |
| `UMB_MODAL_CONTEXT.onSubmit()` resolves on Submit and rejects on Cancel. | Tab draft is committed or discarded with the modal. |
| Block list, block grid and (v17) single block inline elements create an `Umb.Workspace.Block` context and run `workspaceContext` extensions for it. RTE blocks edit in the modal. | One `workspaceContext` extension covers modal and inline block editing. |
| Document/media/member workspaces and `UmbBlockElementManager` share `structure`, `propertyViewGuard` and `propertyValueByAlias(alias, variantId)`. | One evaluator for every owner. The protected `_dataOwner` hack and the property DOM fallback go. |
| `UmbVariantPropertyGuardRule` targets `propertyType.unique` (the property key) with an optional `variantId`. | Rules keyed by property key apply directly; only source aliases need resolving. |
| `structure.contentTypeUniques` lists the owner plus all composition keys. | `GET` takes a list of keys; no composition logic on the server. |
| `splitView.activeVariantsInfo` exists in both versions. | Per-pane variant evaluation. |
| `umbHttpClient` (`@umbraco-cms/backoffice/http-client`) is exported and authenticated. | No generated API client. |
| Core toggle config keys are `default`, `showLabels`, `labelOn`, `labelOff`, the same as `CdCheckbox`. | The checkbox swap only changes `EditorUiAlias` and drops two keys. |

### Server

| Finding | Consequence |
|---|---|
| `ContentTypeEditingServiceBase` sets `PropertyType.Key = property.Key` from the request. | Browser-generated property keys are the persisted keys, safe as our PK. |
| `MigrateDataTypes` already sets `CdCheckbox` `EditorAlias` to `Umbraco.TrueFalse`. | No value or schema change for the swap. |
| The project only references `Umbraco.Cms.Infrastructure` and has no composer. | Add `Umbraco.Cms.Api.Management` references and a composer. |
| Policies `TreeAccessDocumentTypes`, `TreeAccessMediaTypes`, `TreeAccessMemberTypes` and `TreeAccessDocumentsOrMediaOrMembersOrContentTypes` exist in 16.5.1 and 17.7.1. | Read: broad policy. Write: per-kind check. |
| Swashbuckle and `MapToApi` are present in both versions. | Own Swagger doc for the endpoints. |
| Old editors resolve targets by alias, with `property:`, `group:` and `tab:` prefixes (`sharedLogic.ts:66`); the checkbox shows one list and hides the other. | Defines the migration mapping exactly. |
| Shared compositions mean a migrated rule's source can be absent on another doc type. | Missing sources are dropped before evaluation. |
| uSync files hold the pre-migration data type config. | Export uSync after upgrading, or the next import reverts the data types. |

### Still to verify during implementation

- How the old `group:x` alias maps to a DB group: `CompositionPropertyGroups` aliases for groups inside tabs may be `tab/group`, while the old data-mark matched `property-group:x`. Confirm in `TestWebV17` before writing the expansion.
- Whether the doc type Save button stays enabled when only the Visibility tab changed. If Umbraco disables Save on an unchanged workspace, rule-only edits can't be saved without a dirty marker.
- The 'unsaved changes' prompt on leaving compares current against persisted data, so it won't notice staged rules. Leaving after a rule-only edit drops it silently. Check whether a workspace context can contribute to that check; if not, document it as a known gap.
- Whether anything else dispatches `UmbRequestReloadStructureForEntityEvent` for the same doc type `unique` without a save. An extra flush is harmless (the upsert is idempotent and staging is empty afterwards), but a flush *before* a save would persist rules early.

## Data model

Table `ConditionalDisplayersRule`:

| Column | Type | Notes |
|---|---|---|
| `PropertyTypeKey` | GUID, PK | The property the rule applies to |
| `ContentTypeKey` | GUID, indexed | Content type that owns the property (the composition, if it comes from one) |
| `Rules` | nvarchar(max) JSON | See below |

```json
{
  "show": [
    { "propertyKey": "…", "operator": "anyOf", "value": ["news", "blog"] },
    { "connector": "and", "propertyKey": "…", "operator": "isTicked" }
  ],
  "hide": [
    { "propertyKey": "…", "operator": "isEmpty" }
  ]
}
```

A row with both groups empty is deleted, not stored.

## Server (C#)

### Project setup

- Add `Umbraco.Cms.Api.Management` package reference (`[17,)`), alongside the existing `Umbraco.Cms.Infrastructure` one. `ManagementApiControllerBase` and `VersionedApiBackOfficeRoute` live there; the project only references Infrastructure today.
- Add a composer (there isn't one yet; the migration plan is auto-discovered) to register the notification handlers and the Swagger document.

### Table

- **Migration step `AddRuleTable`**, appended to `MigrationPlan` after `MigrateDataTypes`. It creates the table from an NPoco DTO (`[TableName]`, `[PrimaryKey(autoIncrement: false)]` on `PropertyTypeKey`, `[Index]` on `ContentTypeKey`, `[SpecialDbType(SpecialDbTypes.NVARCHARMAX)]` on `Rules` so it works on both SQL Server and SQLite). Guard with `TableExists`.
- Data access goes straight through `IScopeProvider` and `scope.Database`, with no repository layer. It's three queries.

### Management API

`RulesController : ManagementApiControllerBase`, `[VersionedApiBackOfficeRoute("conditionaldisplayers/rules")]`, `[MapToApi("conditionaldisplayers")]` with its own Swagger doc so it stays out of Umbraco's `management` document. Both 16.5.1 and 17.7.1 still use Swashbuckle, and `MapToApi` exists in both.

- `GET ?contentTypeKey=a&contentTypeKey=b`: returns rows for those owner keys.
  - The client already has the owner plus all composition keys from `structure.contentTypeUniques`, so the server doesn't need to resolve compositions or know whether a key is a document, media or member type.
  - Policy: `TreeAccessDocumentsOrMediaOrMembersOrContentTypes`. Content, media and member editors need to read rules, not just settings users.
- `PUT {contentTypeKey}`: body is `[{ propertyTypeKey, rules | null }]`.
  - This is an upsert per property, **not** replace-all. Staging only holds properties the user actually edited, so replace-all would wipe every other property's rules. `null` or both groups empty deletes the row.
  - Trust boundary: look up the content type through `IContentTypeService`, `IMediaTypeService` or `IMemberTypeService`, and return 404 if none match. Reject any `propertyTypeKey` that isn't one of its own `PropertyTypes`. Validate the rules JSON shape (known operators, `connector` only on non-first rows), and cap the body size.
  - Authorise per kind with `IAuthorizationService`: `TreeAccessDocumentTypes`, `TreeAccessMediaTypes` or `TreeAccessMemberTypes`. A single static policy would be either too broad or wrong for two of the three kinds.
- No generated client. The TS side calls it through `umbHttpClient` (`@umbraco-cms/backoffice/http-client`, present in 16.1), which is already authenticated.

### Cleanup handlers

- `INotificationAsyncHandler` for `ContentTypeSaved`, `MediaTypeSaved` and `MemberTypeSaved`. For each saved type, delete rows with `ContentTypeKey = type.Key` whose `PropertyTypeKey` isn't in `type.PropertyTypes`. That's own properties only, which is correct because rows are owned by the type that declares the property.
- The same for the three `*DeletedNotification`s: delete all rows for the type. Deleting a composition removes its rows, and those properties disappear from every type using it.
- Ordering is safe. The client flushes rules *after* the doc type save returns, so cleanup always runs against a structure that already contains any new property.
- Property keys are stable: `ContentTypeEditingServiceBase` builds each `PropertyType` with `Key = property.Key` from the request (17.7.1, line 831), so the GUID generated in the browser is what's persisted.

### Migration step `ConvertLegacyConfig` (one way)

- **Inputs:** every document, media and member type, including element types, through the content type services (`CompositionPropertyTypes`, `CompositionPropertyGroups`). That avoids hand-writing composition SQL. Running services inside a package migration is the normal pattern (`AsyncPackageMigrationBase`, which `RegisterUmbracoPackageEntry` already uses).
- For every property using a CD data type, read its config and build rules on the *target* properties, resolved within that content type's composition set:
  - Dropdown/radio (`items: [{ key, value, show, hide }]`, comma-separated aliases): for target T, values listing T in `show` become one Show condition `source is any of [those keys]`; values listing T in `hide` become one Hide condition likewise.
  - Checkbox: `showIfChecked` gives Show `is ticked` and Hide `is not ticked`; `showIfUnchecked` gives the reverse. This matches the old logic exactly: `checkbox/index.ts:83` shows one list and hides the other.
  - Aliases: strip a `property:` prefix; `group:x` / `tab:x` expand to every property in that container at migration time.
  - Conditions on the same target from different sources are joined with OR.
  - If the target comes from a composition, the rule is stored on the composition-owned property, and the source key is the CD property in *this* doc type. Other doc types using the composition will see a condition whose source doesn't exist for them; see 'missing sources' below.
  - Targets that can't be resolved are logged and skipped.
- **CdCheckbox swap:** `MigrateDataTypes` already set `EditorAlias = Umbraco.TrueFalse`, so only `EditorUiAlias` changes to `Umb.PropertyEditorUi.Toggle`. Core toggle config keys are `default`, `showLabels`, `labelOn` and `labelOff`, the same as ours (`property-editors/toggle/manifests.js`), so the only config change is removing `showIfChecked`/`showIfUnchecked`.
- **CdRadio and CdDropdownFlexible swap:** become core `Umbraco.RadioButtonList` / `Umb.PropertyEditorUi.RadioButtonList` and `Umbraco.DropDown.Flexible` / `Umb.PropertyEditorUi.Dropdown`. Config becomes `{ items: [label…] }` (plus `multiple: false` for the dropdown); `default`, `labelsPos`, `alignHrz` and `asBtn` are dropped. Core stores the label, not the old item key, so stored values in `umbracoPropertyData` and the rules' `anyOf` values are rewritten key to label (dropdown values become a JSON array). Values inside Block List/Grid JSON are not rewritten.
- Update `DataTypeDto` rows directly, the same way `MigrateDataTypes` does.
- Log a summary of what was converted, expanded and skipped.
- **Delete** `ConditionalCheckboxConverter` once no `CdCheckbox` data types can exist. Keep the `CdCheckbox` alias registered as a hidden, deprecated UI for one major in case the migration is skipped or fails, then remove it.

### Missing sources (applies at runtime and in the tab)

A condition whose source property isn't present on the current content type (deleted, or coming from another doc type through a shared composition) is **dropped before evaluation**, not treated as false. If that empties the Show group, the property is visible. Without this, every doc type sharing a composition would hide the migrated property permanently. The Visibility tab flags these rows.

### Known behaviour change from migration

The old editors were stateful: picking a value showed its `show` list and hid its `hide` list, and left everything else as it was. The new model is declarative. A target with Show conditions is hidden whenever none match, so a target that was only shown by value A becomes hidden under B even if B's config never mentioned it. In practice old configs are almost always complementary, but call this out in the release notes.

### uSync will undo the migration

Sites using uSync have the old CD data type config (and `Our.Umbraco.CdCheckbox` as the UI alias) in their `uSync/` files. On the next import, or at boot with import-on-startup, uSync writes it back over the migrated data types. Rules aren't affected (uSync doesn't know about them), but the checkbox swap and the stripped config come back. Release notes must say: upgrade, let the migration run, then **export uSync** before the next import. The same applies to `TestWebV17/uSync/v17` in this repo.

## Client (TypeScript)

### Visibility tab

- `workspaceView` on `Umb.Workspace.PropertyType`, labelled 'Visibility'.
- Reads the property draft from the property type workspace context, and the sibling properties from the owning content type workspace's structure (for the source picker, excluding itself).
- UI: Show group, then Hide group. Each is a list of condition rows (source picker, operator, value input) with an AND/OR dropdown between rows. AND-runs are visually grouped. Show has an 'On page load' placeholder when empty.
- Warnings in the tab:
  - Mandatory is ticked: notice, and the groups go read-only.
  - A condition references a deleted property: row flagged, ignored at runtime.
- On modal Submit, write to the staging context. Nothing is persisted yet.
- Naming: avoid `visibility` in our own types; Umbraco's `UmbPropertyTypeModel.visibility` is already used for member type settings.

### Staging and flush

- A context scoped to the content type workspace holds staged rules per property key.
- On successful doc type save: `PUT` all staged rules for that content type, then clear staging. On discard or leaving without save: drop staging.
- **Save signal (spike done, checked in 16.1.0 and 17.7.1):**
  - The staging context is a `workspaceContext` extension conditioned on `Umb.Workspace.DocumentType` (which also covers element types), `Umb.Workspace.MediaType` and `Umb.Workspace.MemberType`. It lives as long as the doc type workspace, so it survives the property modal opening and closing. It's destroyed on leave, which gives 'discard' for free.
  - `_create`/`_update` swallow errors, so the `requestSubmit` promise resolves even when the save fails and can't be used.
  - `persistedData` can't be used either: it's a `UmbDeepState` that ignores JSON-equal values, so a rule-only save never emits.
  - Flush trigger, two paths, flush only when staging isn't empty:
    - **Update:** listen on `UMB_ACTION_EVENT_CONTEXT` for `UmbRequestReloadStructureForEntityEvent` whose `unique` matches the workspace. It's dispatched only after `structure.save()` succeeds.
    - **Create:** observe `isNew` and flush when it goes from `true` to `false`. That's set only after `structure.create()` succeeds. Read the new key from `getUnique()`.
  - The Visibility tab reaches staging by consuming our context from inside the modal. The property type workspace already consumes `UMB_CONTENT_TYPE_WORKSPACE_CONTEXT` the same way, so the context chain crosses into the modal.
  - Commit to staging on modal Submit: `UMB_MODAL_CONTEXT.onSubmit()` resolves on Submit and rejects on Cancel, so Cancel discards the tab's draft.

### Runtime evaluation

- Replace the editor-driven `CdElement` and `sharedLogic` flow with a workspace-level controller.
- **Attach point (spike done, checked in 16.1.0 and 17.7.1):**
  - One `workspaceContext` extension conditioned on `Umb.Workspace.Document`, `Umb.Workspace.DocumentBlueprint`, `Umb.Workspace.Media`, `Umb.Workspace.Member` and `Umb.Workspace.Block`.
  - Inline blocks are covered: block list, block grid and (v17) single block inline elements all create an `Umb.Workspace.Block` context and run `UmbExtensionsApiInitializer(..., 'workspaceContext', [ctx])` themselves. RTE blocks edit in the modal workspace.
  - The document/media/member workspaces and `UmbBlockElementManager` expose the same public surface: `structure`, `propertyViewGuard` and `propertyValueByAlias(alias, variantId)`. So one evaluator class takes an 'owner', attached to the workspace (document/media/member) or to each of `block.content` and `block.settings`. This removes the dependency on the protected `_dataOwner`, and with it the DOM fallback for properties.
- **Per owner:**
  - Fetch rules for `structure.contentTypeUniques` (owner plus compositions), cached per workspace.
  - Guard rules target `propertyType.unique`, which is our stored key, so target aliases never need resolving. Source keys resolve to aliases through `structure` for `propertyValueByAlias`.
  - Variants: document workspaces evaluate per entry in `splitView.activeVariantsInfo`; blocks use the element manager's `variantId`. Read invariant sources with the invariant variant id, based on the source property's `variesByCulture`/`variesBySegment`.
  - Evaluate (`show` empty means visible, otherwise show if it matches; hide match wins) and apply a guard rule `our-conditionaldisplayers:<propertyKey>:<variant>` with `variantId` set.
- Rules on a Mandatory property are ignored.
- After each pass, auto-hide empty groups and tabs, reusing the DOM hiding in `sharedLogic.ts` (`deepQuerySelectAll`, `data-mark`). Keep `refreshAutoHeightTextareas` on re-show.

### Removals

- `CdElement` show/hide plumbing and the show/hide settings in `manifest.ts`.
- The checkbox editor UI (after the deprecation window).
- `cdMultivalues.ts` keeps key and label columns; `show`/`hide` columns removed.

## Test site and docs

- Update `TestWebV17` uSync data so it has a doc type and an element type exercising every operator, AND/OR precedence, Show plus Hide, a variant source, a Mandatory property with rules, a block with settings rules, and an auto-hidden group and tab.
- Keep a copy of the current uSync data (legacy CD config) to test `ConvertLegacyConfig` against.
- Rewrite `Documentation/`, `README.nuget.md` and the marketplace readme. Document: hidden values still publish; hidden sources still count; rules only see the same element; Mandatory disables rules; the migration behaviour change.
- Note in `CLAUDE.md` that the uSync files won't carry rules until the uSync handler phase.

## Later phases

1. **uSync handler**: serialise rules alongside content types so they move between environments. Until then, rules have to be recreated on each environment (or copied by SQL), which is the main adoption blocker.
2. **Umbraco Deploy connector**: same, for Deploy users.
3. **Shared C# rule evaluator**, a port of the TS evaluator kept in step with shared test vectors. It enables:
   - Server-side validation skipping, so 'mandatory when visible' can replace the Mandatory restriction.
   - An `IsPropertyVisible("alias")` helper for Razor, and optionally stripping hidden properties from Delivery API output. **Done** (`Rules/RuleEvaluator.cs`, `VisibilityService.cs`, `StripHiddenBuilders.cs`). Server-side validation skipping is still open.
4. **Block settings referencing block content** ('layout = X shows field Y').
5. **Explicit tab and group rules**, if auto-hide proves not to be enough.
6. **Content picker 'is specific node'** and other editor-specific operators, on request.
