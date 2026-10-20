using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Persistence.Dtos;
using Umbraco.Extensions;

namespace ConditionalDisplayers.Migrations.Upgrade;

/// <summary>
/// Sets the right EditorAlias (and EditorUiAlias, for data types Umbraco's editor split rewrote) on the CD data types.
/// Registered for two states in <see cref="MigrationPlan"/>: both shipped in 16.x as separate steps, so sites can sit at either.
/// Safe to run twice, rows already correct are skipped.
/// </summary>
internal sealed class MigrateDataTypes(IMigrationContext context, IKeyValueService keyValueService, IJsonSerializer jsonSerializer, ILogger<MigrateDataTypes> logger) : AsyncMigrationBase(context)
{
    public const string State = "{conditionaldisplayers-migrate-datatypes}";
    public const string LegacyState = "{conditionaldisplayers-migrate-cdcheckbox-datatype}";

    private static readonly Dictionary<string, string> EditorAliases = new()
    {
        [LegacyConfigConverter.CheckboxAlias] = "Umbraco.TrueFalse",
        [LegacyConfigConverter.RadioAlias] = "Umbraco.Plain.String",
        [LegacyConfigConverter.DropdownAlias] = "Umbraco.Plain.String",
    };

    protected override Task MigrateAsync()
    {
        var restored = RestoredUiAliases();

        foreach (var dto in Database.Fetch<DataTypeDto>(Sql().Select<DataTypeDto>().From<DataTypeDto>()))
        {
            var uiAlias = restored.GetValueOrDefault(dto.NodeId) ?? dto.EditorUiAlias;
            if (uiAlias is null || !EditorAliases.TryGetValue(uiAlias, out var editorAlias)) continue;
            if (dto.EditorUiAlias == uiAlias && dto.EditorAlias == editorAlias) continue;

            logger.LogInformation("Updating DataTypeId {id} to EditorUiAlias {editorUiAlias} and EditorAlias {editorAlias}", dto.NodeId, uiAlias, editorAlias);
            dto.EditorUiAlias = uiAlias;
            dto.EditorAlias = editorAlias;
            _ = Database.Update(dto);
        }

        return Task.CompletedTask;
    }

    /// <summary>
    /// Umbraco's data editor split (v14+) overwrites the legacy editors' aliases, but saves the old values first, e.g.:
    ///   {"DataTypeId":1086,"EditorUiAlias":"Our.Umbraco.CdCheckbox","EditorAlias":"Umbraco.Plain.String"}
    /// </summary>
    private Dictionary<int, string> RestoredUiAliases()
    {
        var json = keyValueService.GetValue("migrateDataEditorSplitCollectionData");
        if (json.IsNullOrWhiteSpace()) return [];

        return (jsonSerializer.Deserialize<DataTypeEditorAliasMigrationData[]>(json) ?? [])
            .Where(d => d.EditorUiAlias is not null)
            .DistinctBy(d => d.DataTypeId)
            .ToDictionary(d => d.DataTypeId, d => d.EditorUiAlias!);
    }

    private sealed class DataTypeEditorAliasMigrationData
    {
        [JsonPropertyName("DataTypeId")]
        public int DataTypeId { get; set; }

        [JsonPropertyName("EditorUiAlias")]
        public string? EditorUiAlias { get; init; }
    }
}
