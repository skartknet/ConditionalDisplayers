using System.Text.Json;
using ConditionalDisplayers.Rules;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Deploy;
using Umbraco.Deploy.Infrastructure.Artifacts;

namespace ConditionalDisplayers.Deploy;

public static class RulesDeployConstants
{
    public const string EntityType = "conditionaldisplayers-rules";
}

/// <summary>All rules owned by one content, media or member type.</summary>
public sealed record ContentTypeRules(Guid Key, IReadOnlyList<RuleRow> Rows);

/// <summary>Transport container for a type's rules. Each rule set is held as a JSON string so the artifact doesn't depend on the Deploy serializer's handling of <see cref="JsonElement"/>.</summary>
public sealed class RulesArtifact(GuidUdi udi, IEnumerable<ArtifactDependency>? dependencies = null)
    : DeployArtifactBase<GuidUdi>(udi, dependencies)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public SortedDictionary<Guid, string> Rules { get; set; } = [];

    public static RulesArtifact From(ContentTypeRules entity, string name, IEnumerable<ArtifactDependency> dependencies) =>
        new(new GuidUdi(RulesDeployConstants.EntityType, entity.Key).EnsureClosed(), dependencies)
        {
            Name = name,
            Rules = new SortedDictionary<Guid, string>(
                entity.Rows.ToDictionary(r => r.PropertyTypeKey, r => JsonSerializer.Serialize(r.Rules, Json))),
        };

    /// <summary>Rules that are malformed or fail validation are skipped, so a bad artifact can't store junk.</summary>
    public ContentTypeRules ToEntity()
    {
        var key = Udi.Guid;
        var rows = new List<RuleRow>();
        foreach (var (propertyKey, json) in Rules)
        {
            RuleSet? rules;
            try { rules = JsonSerializer.Deserialize<RuleSet>(json, Json); }
            catch (JsonException) { continue; }
            if (rules is null || rules.IsEmpty || RuleValidator.Validate(rules) is not null) continue;
            rows.Add(new RuleRow { PropertyTypeKey = propertyKey, ContentTypeKey = key, Rules = rules });
        }
        return new ContentTypeRules(key, rows);
    }
}
