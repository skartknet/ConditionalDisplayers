using ConditionalDisplayers.Rules;
using System.Collections.Concurrent;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services;

namespace ConditionalDisplayers.Services;

/// <summary>
/// Answers 'is this property visible on this published item?' by running the stored rules against the item's published values.
/// Mirrors the backoffice: only sibling properties on the same item count, hidden sources still count,
/// rules on Mandatory properties are ignored and conditions on missing sources are dropped.
/// </summary>
public sealed class VisibilityService(
    RulesStore store,
    IContentTypeService contentTypes,
    IMediaTypeService mediaTypes,
    IMemberTypeService memberTypes)
{
    // ponytail: local only. Other servers in a load-balanced setup pick up changes when the entry expires.
    private static readonly TimeSpan MaxAge = TimeSpan.FromMinutes(5);

    private readonly ConcurrentDictionary<(PublishedItemType, Guid), Plan> _plans = new();

    private sealed record Plan(long Version, DateTime Built, Dictionary<Guid, string> Aliases, Dictionary<string, RuleSet> Rules);

    public bool IsVisible(IPublishedElement element, string propertyAlias)
    {
        var plan = GetPlan(element.ContentType);
        return !plan.Rules.TryGetValue(propertyAlias, out var rules) || RuleEvaluator.IsVisible(rules, Reader(element, plan));
    }

    /// <summary>Aliases of the properties the rules currently hide on this item.</summary>
    public IReadOnlySet<string> GetHiddenAliases(IPublishedElement element)
    {
        var plan = GetPlan(element.ContentType);
        if (plan.Rules.Count == 0) return new HashSet<string>();

        var read = Reader(element, plan);
        return plan.Rules.Where(r => !RuleEvaluator.IsVisible(r.Value, read)).Select(r => r.Key)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
    }

    private static SourceReader Reader(IPublishedElement element, Plan plan) => key =>
    {
        var property = plan.Aliases.TryGetValue(key, out var alias) ? element.GetProperty(alias) : null;
        return property is null ? (false, null) : (true, property.GetValue());
    };

    private Plan GetPlan(IPublishedContentType type)
    {
        var cacheKey = (type.ItemType, type.Key);
        if (_plans.TryGetValue(cacheKey, out var cached) && cached.Version == store.Version && DateTime.UtcNow - cached.Built < MaxAge)
        {
            return cached;
        }

        var version = store.Version; // read first: a write during the build leaves the plan stale, so it is rebuilt next time
        var properties = GetCompositionPropertyTypes(type);
        var rows = store.GetForProperties(properties.Select(p => p.Key).ToArray());
        var mandatory = properties.Where(p => p.Mandatory).Select(p => p.Key).ToHashSet();
        var aliases = properties.ToDictionary(p => p.Key, p => p.Alias);

        var plan = new Plan(
            version,
            DateTime.UtcNow,
            aliases,
            rows.Where(r => !mandatory.Contains(r.PropertyTypeKey) && aliases.ContainsKey(r.PropertyTypeKey))
                .ToDictionary(r => aliases[r.PropertyTypeKey], r => r.Rules, StringComparer.OrdinalIgnoreCase));
        _plans[cacheKey] = plan;
        return plan;
    }

    private IReadOnlyCollection<IPropertyType> GetCompositionPropertyTypes(IPublishedContentType type)
    {
        IContentTypeComposition? definition = type.ItemType switch
        {
            PublishedItemType.Media => mediaTypes.Get(type.Key),
            PublishedItemType.Member => memberTypes.Get(type.Key),
            _ => contentTypes.Get(type.Key),
        };
        return definition?.CompositionPropertyTypes.ToArray() ?? [];
    }
}
