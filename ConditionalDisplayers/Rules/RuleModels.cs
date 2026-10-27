using System.Text.Json;
using System.Text.Json.Serialization;

namespace ConditionalDisplayers.Rules;

public sealed class Condition
{
    public Guid PropertyKey { get; set; }
    public string Operator { get; set; } = string.Empty;
    public string? Connector { get; set; }
    public JsonElement? Value { get; set; }
}

public sealed class RuleSet
{
    public List<Condition> Show { get; set; } = [];
    public List<Condition> Hide { get; set; } = [];

    [JsonIgnore]
    public bool IsEmpty => Show.Count == 0 && Hide.Count == 0;
}

public sealed class RuleRow
{
    public Guid PropertyTypeKey { get; set; }
    public Guid ContentTypeKey { get; set; }
    public RuleSet Rules { get; set; } = new();
}

public sealed class RuleUpdate
{
    public Guid PropertyTypeKey { get; set; }
    public RuleSet? Rules { get; set; }
}

internal static class RuleValidator
{
    public const int MaxUpdates = 500;
    public const int MaxConditions = 50;

    private static readonly HashSet<string> Operators =
    [
        "isTicked", "isNotTicked", "anyOf", "noneOf",
        "equals", "notEquals", "contains", "isEmpty", "isNotEmpty",
        "eq", "neq", "gt", "lt", "gte", "lte",
    ];

    public static string? Validate(RuleSet rules) =>
        ValidateGroup(rules.Show) ?? ValidateGroup(rules.Hide);

    private static string? ValidateGroup(List<Condition> group)
    {
        if (group.Count > MaxConditions) return "Too many conditions.";
        for (var i = 0; i < group.Count; i++)
        {
            var c = group[i];
            if (!Operators.Contains(c.Operator)) return $"Unknown operator '{c.Operator}'.";
            if (i == 0 && c.Connector is not null) return "The first condition cannot have a connector.";
            if (i > 0 && c.Connector is not ("and" or "or")) return "Conditions after the first need a connector of 'and' or 'or'.";
        }
        return null;
    }
}
