using Microsoft.Extensions.Logging;
using System.Text.Json.Serialization;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Persistence.Dtos;
using Umbraco.Extensions;

namespace ConditionalDisplayers.Migrations.Upgrade;

internal sealed class MigrateDataTypesToV17(IMigrationContext context, IKeyValueService keyValueService, IJsonSerializer jsonSerializer, ILogger<MigrateDataTypesToV17> logger) : AsyncMigrationBase(context)
{
    public const string State = "{conditionaldisplayers-migrate-cdcheckbox-datatype}";

    private static readonly Dictionary<string, (string EditorUiAlias, string EditorAlias)> Targets = new()
    {
        ["Our.Umbraco.CdCheckbox"] = ("Umb.PropertyEditorUi.Toggle", "Umbraco.TrueFalse"),
        ["Our.Umbraco.CdDropdownFlexible"] = ("Umb.PropertyEditorUi.Dropdown", "Umbraco.DropDown.Flexible"),
        ["Our.Umbraco.CdRadio"] = ("Umb.PropertyEditorUi.RadioButtonList", "Umbraco.RadioButtonList"),
    };

    protected override Task MigrateAsync()
    {
        // Look up the pre-migration data for data editor splits
        var dataEditorSplitCollectionData = keyValueService.GetValue("migrateDataEditorSplitCollectionData");
        if (dataEditorSplitCollectionData.IsNullOrWhiteSpace())
        {
            return Task.CompletedTask;
        }
        DataTypeEditorAliasMigrationData[] migrationData = jsonSerializer.Deserialize<DataTypeEditorAliasMigrationData[]>(dataEditorSplitCollectionData) ?? [];

        var sql = Sql()
            .Select<DataTypeDto>()
            .AndSelect<NodeDto>()
            .From<DataTypeDto>()
            .InnerJoin<NodeDto>()
            .On<DataTypeDto, NodeDto>(left => left.NodeId, right => right.NodeId);

        var dataTypeDtos = Database.Fetch<DataTypeDto>(sql);

        // Look for the old Data Type ids - e.g.:
        //   {"DataTypeId":1086,"EditorUiAlias":"Our.Umbraco.CdCheckbox","EditorAlias":"Umbraco.Plain.String"},
        foreach (var data in migrationData)
        {
            if (data.EditorUiAlias is null || !Targets.TryGetValue(data.EditorUiAlias, out var target))
            {
                continue;
            }

            var dataTypeDto = dataTypeDtos.FirstOrDefault(x => x.NodeId == data.DataTypeId);
            if (dataTypeDto is null)
            {
                continue;
            }

            logger.LogInformation("Updating EditorUiAlias and EditorAlias for DataTypeId {id}", dataTypeDto.NodeId);
            dataTypeDto.EditorUiAlias = target.EditorUiAlias;
            dataTypeDto.EditorAlias = target.EditorAlias;
            _ = Database.Update(dataTypeDto);
        }

        return Task.CompletedTask;
    }
    
    private class DataTypeEditorAliasMigrationData
    {
        [JsonPropertyName("DataTypeId")]
        public int DataTypeId { get; set; }

        [JsonPropertyName("EditorUiAlias")]
        public string? EditorUiAlias { get; init; }

        [JsonPropertyName("EditorAlias")]
        public string? EditorAlias { get; init; }
    }
}