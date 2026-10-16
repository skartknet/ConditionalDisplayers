using System.Text.Json;
using System.Text.Json.Nodes;
using ConditionalDisplayers.Rules;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Persistence.Dtos;
using Umbraco.Extensions;

namespace ConditionalDisplayers.Migrations.Upgrade;

/// <summary>
/// One way: turns the show/hide config on CD data types into visibility rules on the target properties,
/// swaps CdCheckbox for the core Toggle and strips the old config keys.
/// </summary>
internal sealed class ConvertLegacyConfig(
    IMigrationContext context,
    IContentTypeService contentTypeService,
    IMediaTypeService mediaTypeService,
    IMemberTypeService memberTypeService,
    ILogger<ConvertLegacyConfig> logger) : AsyncMigrationBase(context)
{
    public const string State = "{conditionaldisplayers-convert-legacy-config}";

    private const string ToggleUiAlias = "Umb.PropertyEditorUi.Toggle";
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    protected override Task MigrateAsync()
    {
        var sql = Sql()
            .Select<DataTypeDto>()
            .AndSelect<NodeDto>()
            .From<DataTypeDto>()
            .InnerJoin<NodeDto>()
            .On<DataTypeDto, NodeDto>(l => l.NodeId, r => r.NodeId)
            .Where<DataTypeDto>(x => x.EditorUiAlias == LegacyConfigConverter.CheckboxAlias
                || x.EditorUiAlias == LegacyConfigConverter.RadioAlias
                || x.EditorUiAlias == LegacyConfigConverter.DropdownAlias);
        var dataTypes = Database.Fetch<DataTypeDto>(sql);
        if (dataTypes.Count == 0) return Task.CompletedTask;

        var configs = dataTypes.ToDictionary(d => d.NodeDto.UniqueId, d => ParseConfig(d.Configuration));
        var kinds = dataTypes.ToDictionary(d => d.NodeDto.UniqueId, d => LegacyConfigConverter.KindOf(d.EditorUiAlias)!.Value);

        IContentTypeComposition[] types =
        [
            .. contentTypeService.GetAll(),
            .. mediaTypeService.GetAll(),
            .. memberTypeService.GetAll(),
        ];
        // A target from a composition belongs to the composition, so rules are stored under the owner.
        var owners = types.SelectMany(t => t.PropertyTypes.Select(p => (p.Key, Owner: t.Key))).DistinctBy(x => x.Key).ToDictionary(x => x.Key, x => x.Owner);

        var rules = new Dictionary<Guid, RuleSet>();
        var skipped = 0;
        var sources = 0;
        foreach (var type in types)
        {
            var resolve = Resolver(type);
            foreach (var property in type.PropertyTypes.Where(p => kinds.ContainsKey(p.DataTypeKey)))
            {
                sources++;
                LegacyConfigConverter.Convert(property.Key, kinds[property.DataTypeKey], configs[property.DataTypeKey], resolve, rules,
                    alias =>
                    {
                        skipped++;
                        logger.LogWarning("Skipped '{alias}' from '{property}' on '{type}': no matching property, group or tab.", alias, property.Alias, type.Alias);
                    });
            }
        }

        var written = 0;
        foreach (var (target, set) in rules)
        {
            if (!owners.TryGetValue(target, out var owner) || Database.Exists<RuleDto>(target)) continue;
            Database.Insert(new RuleDto { PropertyTypeKey = target, ContentTypeKey = owner, Rules = JsonSerializer.Serialize(set, Json) });
            written++;
        }

        foreach (var dto in dataTypes)
        {
            var config = configs[dto.NodeDto.UniqueId];
            var kind = kinds[dto.NodeDto.UniqueId];
            var changed = LegacyConfigConverter.StripConfig(kind, config);
            if (kind == LegacyKind.Checkbox) { dto.EditorUiAlias = ToggleUiAlias; changed = true; }
            if (!changed) continue;
            dto.Configuration = config.ToJsonString();
            Database.Update(dto);
        }

        logger.LogInformation("Converted legacy Conditional Displayers config: {sources} source properties, {written} target properties with rules, {skipped} aliases skipped, {dataTypes} data types updated.",
            sources, written, skipped, dataTypes.Count);
        return Task.CompletedTask;
    }

    private static JsonObject ParseConfig(string? json)
    {
        try { return JsonNode.Parse(string.IsNullOrWhiteSpace(json) ? "{}" : json) as JsonObject ?? []; }
        catch (JsonException) { return []; }
    }

    /// <summary>Resolves a legacy alias within one content type's composition set.</summary>
    private static Func<string, IReadOnlyCollection<Guid>> Resolver(IContentTypeComposition type)
    {
        var properties = type.CompositionPropertyTypes.ToList();
        var groups = type.CompositionPropertyGroups.ToList();

        static bool Same(string? a, string b) => string.Equals(a, b, StringComparison.OrdinalIgnoreCase);
        static IEnumerable<Guid> Keys(IEnumerable<PropertyGroup> gs) => gs.Where(g => g.PropertyTypes is not null).SelectMany(g => g.PropertyTypes!).Select(p => p.Key);

        return alias =>
        {
            if (alias.StartsWith("group:", StringComparison.OrdinalIgnoreCase))
            {
                // Groups are stored as 'tab/group', and people wrote either the full alias or the last part.
                var name = alias["group:".Length..];
                return Keys(groups.Where(g => g.Type == PropertyGroupType.Group && (Same(g.Alias, name) || Same(g.Alias.Split('/').Last(), name)))).ToHashSet();
            }
            if (alias.StartsWith("tab:", StringComparison.OrdinalIgnoreCase))
            {
                var name = alias["tab:".Length..];
                return Keys(groups.Where(g => Same(g.Alias, name) || g.Alias.StartsWith(name + "/", StringComparison.OrdinalIgnoreCase))).ToHashSet();
            }
            return properties.Where(p => Same(p.Alias, alias)).Select(p => p.Key).ToHashSet();
        };
    }
}
