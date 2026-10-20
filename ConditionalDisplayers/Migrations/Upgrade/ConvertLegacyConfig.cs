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
/// swaps CdCheckbox, CdRadio and CdDropdownFlexible for the core Toggle, Radio button list and Dropdown
/// (same items), and rewrites stored radio/dropdown values from the old item key to the item label.
/// </summary>
internal sealed class ConvertLegacyConfig(
    IMigrationContext context,
    IContentTypeService contentTypeService,
    IMediaTypeService mediaTypeService,
    IMemberTypeService memberTypeService,
    ILogger<ConvertLegacyConfig> logger) : AsyncMigrationBase(context)
{
    public const string State = "{conditionaldisplayers-convert-legacy-config}";

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
        var labels = dataTypes.ToDictionary(d => d.NodeDto.UniqueId, d => LegacyConfigConverter.KeyToLabel(configs[d.NodeDto.UniqueId]));

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

        var rewritten = 0;
        foreach (var property in types.SelectMany(t => t.PropertyTypes).DistinctBy(p => p.Key)
                     .Where(p => kinds.TryGetValue(p.DataTypeKey, out var k) && k != LegacyKind.Checkbox))
            rewritten += RewriteValues(property.Id, labels[property.DataTypeKey], kinds[property.DataTypeKey] == LegacyKind.Dropdown);

        foreach (var dto in dataTypes)
        {
            var config = configs[dto.NodeDto.UniqueId];
            var kind = kinds[dto.NodeDto.UniqueId];
            if (kind == LegacyKind.Checkbox) LegacyConfigConverter.StripConfig(config);
            else config = LegacyConfigConverter.CoreConfig(kind, config);
            (dto.EditorAlias, dto.EditorUiAlias) = LegacyConfigConverter.CoreEditor(kind);
            dto.Configuration = config.ToJsonString();
            Database.Update(dto);
        }

        logger.LogInformation("Converted legacy Conditional Displayers config: {sources} source properties, {written} target properties with rules, {skipped} aliases skipped, {dataTypes} data types updated, {rewritten} stored values rewritten.",
            sources, written, skipped, dataTypes.Count, rewritten);
        return Task.CompletedTask;
    }

    /// <summary>
    /// Core radio stores the label as a plain string, core dropdown a JSON array of labels; the old editors stored the item key.
    /// A value that isn't a known key is kept as is. Covers every version and culture of the property.
    /// </summary>
    private int RewriteValues(int propertyTypeId, Dictionary<string, string> keyToLabel, bool asArray)
    {
        // PropertyDataDto is internal to Umbraco, so this goes through plain SQL.
        var rows = Database.Fetch<ValueRow>("SELECT id, varcharValue, textValue FROM umbracoPropertyData WHERE propertyTypeId = @0", propertyTypeId);
        var count = 0;
        foreach (var row in rows)
        {
            var old = row.VarcharValue ?? row.TextValue;
            if (string.IsNullOrEmpty(old)) continue;
            var label = keyToLabel.GetValueOrDefault(old, old);
            Database.Execute("UPDATE umbracoPropertyData SET varcharValue = @0, textValue = NULL WHERE id = @1",
                asArray ? JsonSerializer.Serialize(new[] { label }) : label, row.Id);
            count++;
        }
        return count;
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

    private sealed record ValueRow(int Id, string? VarcharValue, string? TextValue);
}
