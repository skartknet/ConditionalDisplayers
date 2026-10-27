using System.Collections;
using System.Globalization;
using System.Text.Json;

namespace ConditionalDisplayers.Rules;

/// <summary>What the evaluator knows about a source property. <c>Exists</c> is false when it isn't on this content type.</summary>
internal delegate (bool Exists, object? Value) SourceReader(Guid propertyKey);

/// <summary>
/// Port of <c>Client/src/rules/evaluate.ts</c>. Keep the two in step: <c>RuleEvaluatorTests</c> carries the same vectors as <c>rules.test.ts</c>.
/// Values are published (converted) values, so a tick is a bool and a dropdown is a list of labels.
/// </summary>
internal static class RuleEvaluator
{
    public static bool IsEmptyValue(object? value) => value switch
    {
        null => true,
        string s => string.IsNullOrWhiteSpace(s),
        IEnumerable e => !e.GetEnumerator().MoveNext(),
        _ => false,
    };

    public static object? FromJson(JsonElement? element) => element is not { } e ? null : e.ValueKind switch
    {
        JsonValueKind.String => e.GetString(),
        JsonValueKind.Number => e.GetDouble(),
        JsonValueKind.True => true,
        JsonValueKind.False => false,
        JsonValueKind.Array => e.EnumerateArray().Select(x => FromJson(x)).ToList(),
        _ => null,
    };

    private static string Str(object? value) => Convert.ToString(value, CultureInfo.InvariantCulture) ?? "";

    private static List<string> ToList(object? value) =>
        value is IEnumerable e and not string ? e.Cast<object?>().Select(Str).ToList()
        : IsEmptyValue(value) ? []
        : [Str(value)];

    private static string Text(object? value) => Str(value).ToLowerInvariant();

    private static double ToNumber(object? value)
    {
        if (IsEmptyValue(value) || value is IEnumerable and not string) return double.NaN;
        if (value is string s) return double.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out var n) ? n : double.NaN;
        try { return Convert.ToDouble(value, CultureInfo.InvariantCulture); }
        catch (Exception e) when (e is InvalidCastException or FormatException) { return double.NaN; }
    }

    /// <summary>Text matching is case-insensitive; a number comparison against an empty or non-numeric value is always false.</summary>
    private static bool Matches(Condition condition, object? value)
    {
        var expected = FromJson(condition.Value);
        switch (condition.Operator)
        {
            case "isTicked": return value is true;
            case "isNotTicked": return value is not true;
            case "isEmpty": return IsEmptyValue(value);
            case "isNotEmpty": return !IsEmptyValue(value);
            case "anyOf": { var wanted = ToList(expected); return ToList(value).Any(wanted.Contains); }
            case "noneOf": { var wanted = ToList(expected); return !ToList(value).Any(wanted.Contains); }
            case "equals": return Text(value) == Text(expected);
            case "notEquals": return Text(value) != Text(expected);
            case "contains": return Text(value).Contains(Text(expected), StringComparison.Ordinal);
        }

        var a = ToNumber(value);
        var b = ToNumber(expected);
        if (double.IsNaN(a) || double.IsNaN(b)) return false;
        return condition.Operator switch
        {
            "eq" => a == b,
            "neq" => a != b,
            "gt" => a > b,
            "lt" => a < b,
            "gte" => a >= b,
            "lte" => a <= b,
            _ => false,
        };
    }

    /// <summary>
    /// Evaluates a condition list where AND binds tighter than OR (<c>A or B and C</c> is <c>A or (B and C)</c>).
    /// Conditions whose source is missing are dropped, not treated as false. Returns null when none remain.
    /// </summary>
    public static bool? EvaluateGroup(IReadOnlyList<Condition> conditions, SourceReader read)
    {
        var runs = new List<List<Condition>>();
        for (var i = 0; i < conditions.Count; i++)
        {
            if (i == 0 || conditions[i].Connector == "or") runs.Add([conditions[i]]);
            else runs[^1].Add(conditions[i]);
        }

        var any = false;
        var result = false;
        foreach (var run in runs)
        {
            var present = run.Select(c => (Condition: c, Source: read(c.PropertyKey))).Where(x => x.Source.Exists).ToList();
            if (present.Count == 0) continue;
            any = true;
            if (present.All(x => Matches(x.Condition, x.Source.Value))) result = true;
        }
        return any ? result : null;
    }

    /// <summary>Show empty (after dropping missing sources) means visible, otherwise visible when Show matches. A Hide match always wins.</summary>
    public static bool IsVisible(RuleSet rules, SourceReader read) =>
        (EvaluateGroup(rules.Show, read) ?? true) && !(EvaluateGroup(rules.Hide, read) ?? false);
}
