using System.Text.Json;
using System.Text.Json.Nodes;
using ConditionalDisplayers.Rules;

namespace ConditionalDisplayers.Migrations.Upgrade;

internal enum LegacyKind { Checkbox, List }

/// <summary>Turns the old show/hide data type config into visibility rules on the target properties.</summary>
internal static class LegacyConfigConverter
{
    public const string CheckboxAlias = "Our.Umbraco.CdCheckbox";
    public const string RadioAlias = "Our.Umbraco.CdRadio";
    public const string DropdownAlias = "Our.Umbraco.CdDropdownFlexible";

    public static LegacyKind? KindOf(string? editorUiAlias) => editorUiAlias switch
    {
        CheckboxAlias => LegacyKind.Checkbox,
        RadioAlias or DropdownAlias => LegacyKind.List,
        _ => null,
    };

    /// <summary>
    /// Adds rules for every target the source's config mentions. <paramref name="resolve"/> maps an alias
    /// (after stripping <c>property:</c>; groups and tabs come as <c>group:x</c> / <c>tab:x</c>) to property keys.
    /// Unresolvable aliases go to <paramref name="skipped"/>.
    /// </summary>
    public static void Convert(
        Guid sourceKey, LegacyKind kind, JsonObject config,
        Func<string, IReadOnlyCollection<Guid>> resolve, Dictionary<Guid, RuleSet> rules, Action<string> skipped)
    {
        if (kind == LegacyKind.Checkbox)
        {
            foreach (var t in Targets(config["showIfChecked"], resolve, skipped))
            {
                Add(rules, t, show: true, new Condition { PropertyKey = sourceKey, Operator = "isTicked" });
                Add(rules, t, show: false, new Condition { PropertyKey = sourceKey, Operator = "isNotTicked" });
            }
            foreach (var t in Targets(config["showIfUnchecked"], resolve, skipped))
            {
                Add(rules, t, show: true, new Condition { PropertyKey = sourceKey, Operator = "isNotTicked" });
                Add(rules, t, show: false, new Condition { PropertyKey = sourceKey, Operator = "isTicked" });
            }
            return;
        }

        // target -> keys of the items that show it / hide it
        var shown = new Dictionary<Guid, List<string>>();
        var hidden = new Dictionary<Guid, List<string>>();
        foreach (var item in config["items"]?.AsArray().OfType<JsonObject>() ?? [])
        {
            var key = item["key"]?.GetValue<string>();
            if (string.IsNullOrEmpty(key)) continue;
            foreach (var t in Targets(item["show"], resolve, skipped)) Bucket(shown, t).Add(key);
            foreach (var t in Targets(item["hide"], resolve, skipped)) Bucket(hidden, t).Add(key);
        }
        foreach (var (t, keys) in shown) Add(rules, t, show: true, AnyOf(sourceKey, keys));
        foreach (var (t, keys) in hidden) Add(rules, t, show: false, AnyOf(sourceKey, keys));
    }

    /// <summary>Removes the keys the new model has no use for. Returns false when nothing changed.</summary>
    public static bool StripConfig(LegacyKind kind, JsonObject config)
    {
        var changed = false;
        if (kind == LegacyKind.Checkbox)
        {
            changed |= config.Remove("showIfChecked");
            changed |= config.Remove("showIfUnchecked");
        }
        else
        {
            foreach (var item in config["items"]?.AsArray().OfType<JsonObject>() ?? [])
            {
                changed |= item.Remove("show");
                changed |= item.Remove("hide");
            }
        }
        return changed;
    }

    private static IEnumerable<Guid> Targets(JsonNode? list, Func<string, IReadOnlyCollection<Guid>> resolve, Action<string> skipped)
    {
        var text = list is JsonValue v && v.TryGetValue<string>(out var s) ? s : null;
        var found = new HashSet<Guid>();
        foreach (var raw in (text ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            var alias = raw.StartsWith("property:", StringComparison.OrdinalIgnoreCase) ? raw["property:".Length..] : raw;
            var keys = resolve(alias);
            if (keys.Count == 0) skipped(raw);
            foreach (var k in keys) found.Add(k);
        }
        return found;
    }

    private static List<string> Bucket(Dictionary<Guid, List<string>> map, Guid key) =>
        map.TryGetValue(key, out var list) ? list : map[key] = [];

    private static Condition AnyOf(Guid sourceKey, List<string> keys) => new()
    {
        PropertyKey = sourceKey,
        Operator = "anyOf",
        Value = JsonSerializer.SerializeToElement(keys.Distinct()),
    };

    /// <summary>Appends with OR, so a target driven by several sources shows or hides when any of them says so.</summary>
    private static void Add(Dictionary<Guid, RuleSet> rules, Guid target, bool show, Condition condition)
    {
        if (!rules.TryGetValue(target, out var set)) rules[target] = set = new RuleSet();
        var list = show ? set.Show : set.Hide;
        condition.Connector = list.Count == 0 ? null : "or";
        list.Add(condition);
    }
}
