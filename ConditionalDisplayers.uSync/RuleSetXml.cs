using System.Text.Json;
using System.Xml.Linq;
using ConditionalDisplayers.Rules;

namespace ConditionalDisplayers.USync;

/// <summary>uSync file format: one &lt;Rule&gt; per property, holding the rule set as JSON.</summary>
internal static class RuleSetXml
{
    public const string ItemType = "ConditionalDisplayersRules";
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public static IEnumerable<XElement> Write(IEnumerable<RuleRow> rows) =>
        rows.OrderBy(r => r.PropertyTypeKey).Select(r => new XElement("Rule",
            new XAttribute("PropertyTypeKey", r.PropertyTypeKey),
            new XCData(JsonSerializer.Serialize(r.Rules, Json))));

    /// <summary>Rules that are malformed or fail validation are skipped, so a bad file can't store junk.</summary>
    public static List<RuleRow> Read(Guid contentTypeKey, XElement node)
    {
        var rows = new List<RuleRow>();
        foreach (var e in node.Elements("Rule"))
        {
            if (!Guid.TryParse((string?)e.Attribute("PropertyTypeKey"), out var key)) continue;
            RuleSet? rules;
            try { rules = JsonSerializer.Deserialize<RuleSet>(e.Value, Json); }
            catch (JsonException) { continue; }
            if (rules is null || rules.IsEmpty || RuleValidator.Validate(rules) is not null) continue;
            rows.Add(new RuleRow { PropertyTypeKey = key, ContentTypeKey = contentTypeKey, Rules = rules });
        }
        return rows;
    }
}
