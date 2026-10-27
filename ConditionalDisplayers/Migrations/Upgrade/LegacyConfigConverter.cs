using System.Text.Json;
using System.Text.Json.Nodes;
using ConditionalDisplayers.Rules;

namespace ConditionalDisplayers.Migrations.Upgrade;

internal enum LegacyKind { Checkbox, Radio, Dropdown }

/// <summary>Turns the old show/hide data type config into visibility rules on the target properties.</summary>
internal static class LegacyConfigConverter
{
    public const string CheckboxAlias = "Our.Umbraco.CdCheckbox";
    public const string RadioAlias = "Our.Umbraco.CdRadio";
    public const string DropdownAlias = "Our.Umbraco.CdDropdownFlexible";

    public static LegacyKind? KindOf(string? editorUiAlias) => editorUiAlias switch
    {
        CheckboxAlias => LegacyKind.Checkbox,
        RadioAlias => LegacyKind.Radio,
        DropdownAlias => LegacyKind.Dropdown,
        _ => null,
    };

    /// <summary>The core editor (schema, UI) that replaces each legacy editor.</summary>
    public static (string Schema, string Ui) CoreEditor(LegacyKind kind) => kind switch
    {
        LegacyKind.Checkbox => ("Umbraco.TrueFalse", "Umb.PropertyEditorUi.Toggle"),
        LegacyKind.Radio => ("Umbraco.RadioButtonList", "Umb.PropertyEditorUi.RadioButtonList"),
        _ => ("Umbraco.DropDown.Flexible", "Umb.PropertyEditorUi.Dropdown"),
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

        // target -> labels of the items that show it / hide it (core editors store the label, not the old key)
        var shown = new Dictionary<Guid, List<string>>();
        var hidden = new Dictionary<Guid, List<string>>();
        foreach (var item in Items(config))
        {
            var label = Label(item);
            if (string.IsNullOrEmpty(label)) continue;
            foreach (var t in Targets(item["show"], resolve, skipped)) Bucket(shown, t).Add(label);
            foreach (var t in Targets(item["hide"], resolve, skipped)) Bucket(hidden, t).Add(label);
        }
        foreach (var (t, keys) in shown) Add(rules, t, show: true, AnyOf(sourceKey, keys));
        foreach (var (t, keys) in hidden) Add(rules, t, show: false, AnyOf(sourceKey, keys));
    }

    /// <summary>Removes the checkbox keys the new model has no use for. Returns false when nothing changed.</summary>
    public static bool StripConfig(JsonObject config) => config.Remove("showIfChecked") | config.Remove("showIfUnchecked");

    /// <summary>
    /// Config for the core radio or dropdown: one string per item, using the old label. Legacy `default`,
    /// `labelsPos`, `alignHrz` and `asBtn` have no core equivalent and are dropped.
    /// </summary>
    public static JsonObject CoreConfig(LegacyKind kind, JsonObject config)
    {
        var labels = Items(config).Select(Label).Where(l => !string.IsNullOrEmpty(l)).Distinct().Select(l => (JsonNode?)JsonValue.Create(l));
        var core = new JsonObject { ["items"] = new JsonArray(labels.ToArray()) };
        if (kind == LegacyKind.Dropdown) core["multiple"] = false;
        return core;
    }

    /// <summary>Old stored key to new stored value (the label), for rewriting existing content.</summary>
    public static Dictionary<string, string> KeyToLabel(JsonObject config) => Items(config)
        .Select(i => (Key: i["key"]?.GetValue<string>(), Label: Label(i)))
        .Where(x => !string.IsNullOrEmpty(x.Key) && !string.IsNullOrEmpty(x.Label))
        .DistinctBy(x => x.Key)
        .ToDictionary(x => x.Key!, x => x.Label!);

    private static IEnumerable<JsonObject> Items(JsonObject config) => config["items"]?.AsArray().OfType<JsonObject>() ?? [];

    private static string? Label(JsonObject item)
    {
        var value = item["value"]?.GetValue<string>();
        return string.IsNullOrWhiteSpace(value) ? item["key"]?.GetValue<string>() : value;
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
