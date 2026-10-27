# Hiding and Showing Tabs and Groups

With Conditional Displayers you can also show and hide an entire Tab or a Property Group.

> ⚠️ **Umbraco 15+ note:** Starting with Umbraco 15, the backoffice was rebuilt using Lit-based web components, and the way elements are identified in the DOM changed completely. The `data-element` attribute described in earlier versions of this guide no longer exists. This version of the guide documents the new behavior, which relies on the `data-mark` attribute instead. If you're running an Umbraco version older than 15, refer to the legacy guide instead.

Unlike properties, we're not exposed to any aliases for tabs or groups directly through configuration, but Umbraco's new backoffice renders both with a `data-mark` attribute that we can target reliably, since it's generated from the tab or group's actual alias.

Given that tabs and groups need to have unique aliases within a content type, we can target them in a similar way we do for properties.

With this available, you can target groups and tabs regardless of where the Conditional Displayer property itself sits, including targeting elements in different tabs than the one containing the Displayer.

> ℹ️ Did you know that you can target properties, groups, and tabs that are in a different tab than the Conditional Displayer property itself?

## How to target the different sections

### 1. Tabs

- Tabs are matched using the **alias** of the tab, not its display name. Umbraco auto-generates this alias from the tab's name — for example, a tab named "Tab 1" typically gets the alias `tab-1` (note the hyphen).
- The alias Umbraco generates does **not** always match what you'd expect from the display name. Always verify the real alias before configuring a rule — see [Double Checking](#double-checking) below.
- To target a tab, use the prefix `tab:` followed by the tab's alias, e.g. **`tab:tab-1`**.

### 2. Property Groups

- Groups are matched using the group's **alias**, the same way properties are.
- To target a group, use the prefix `group:` followed by the group's alias, e.g. **`group:group1`**.
- This works for any group, including the unnamed/default group that sits at the top of a tab (its alias is typically `root` unless explicitly renamed).

### 3. Properties

- Properties continue to work as before. Use the prefix `property:` followed by the property's alias, or simply the alias on its own with no prefix, e.g. **`property:myProperty`** or **`myProperty`**.

## Double Checking

The most common configuration mistake is assuming a tab or group's alias matches its display name, when Umbraco's auto-generated alias may differ (most often by adding a hyphen, e.g. "Tab 1" → `tab-1`). Always confirm the real alias before configuring a rule, rather than guessing from the label.

You can inspect the actual `data-mark` values directly from the browser console on the content edit screen. Open Dev Tools, switch to the Console tab, and run:

```js
function findAll(selector, root = document.body) {
    const results = [];
    function walk(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches?.(selector)) results.push(node);
        for (const child of node.children) walk(child);
        if (node.shadowRoot) for (const child of node.shadowRoot.children) walk(child);
    }
    walk(root);
    return results;
}

// List every tab's real alias
findAll('[data-mark^="content-tab:tab/"]').map(el => el.getAttribute('data-mark'));

// List every group's real alias
findAll('[data-mark^="property-group:"]').map(el => el.getAttribute('data-mark'));
```

The values returned will look like `content-tab:tab/tab-1` or `property-group:group1`. The part after the final `/` or `:` is the alias you should use in your configuration (e.g. `tab:tab-1`, `group:group1`).

## Configuring the Displayers

Similar to what you do with properties, just include the prefixed values in your Data Type configuration's "What to show" and "What to hide" fields, comma-separated:

```
What to show: tab:tab-1,group:group1
What to hide: tab:tab-2,tab:tab-3
```

You can mix properties, groups, and tabs freely in the same rule. Just plan out what you're hiding and showing at the same time so the end result makes sense to the content editor.

> ⚠️ **IMPORTANT:** Be careful not to hide any element that contains the Conditional Displayer that targets it. If a tab or group containing the Displayer itself gets hidden, you'll have no way to interact with it to make things visible again, and may end up in a confusing or unrecoverable state for that content node.

> ⚠️ **Known limitation:** If a hidden tab happens to be the one currently active/open in the editor when the rule fires, the tab disappears from the tab strip, but Umbraco's backoffice does not automatically redirect the user to a different tab. Avoid configuring rules where the currently active tab can be hidden, or guide users to switch tabs before triggering the condition.
