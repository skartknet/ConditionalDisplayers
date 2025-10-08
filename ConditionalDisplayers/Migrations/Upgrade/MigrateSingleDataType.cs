using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Persistence.Dtos;
using Umbraco.Extensions;

namespace ConditionalDisplayers.Migrations.Upgrade;

internal sealed class MigrateSingleDataType(IMigrationContext context, IKeyValueService keyValueService, IJsonSerializer jsonSerializer, ILogger<MigrateSingleDataType> logger) : AsyncMigrationBase(context)
{
    public const string State = "{conditionaldisplayers-migrate-cdcheckbox-datatype}";
    protected override Task MigrateAsync()
    {
        // Look up the pre-migration data for data editor splits
        var dataEditorSplitCollectionData = keyValueService.GetValue("migrateDataEditorSplitCollectionData");
        if (dataEditorSplitCollectionData.IsNullOrWhiteSpace())
        {
            return Task.CompletedTask;
        }
        DataTypeEditorAliasMigrationData[] migrationData = jsonSerializer.Deserialize<DataTypeEditorAliasMigrationData[]>(dataEditorSplitCollectionData) ?? [];

        // Look for the old Data Type id - e.g.:
        //   {"DataTypeId":1086,"EditorUiAlias":"Our.Umbraco.CdCheckbox","EditorAlias":"Umbraco.Plain.String"},
        List<int> mapsEditorIds = [.. migrationData.Where(d => d.EditorUiAlias == "Our.Umbraco.CdCheckbox").Select(d => d.DataTypeId)];

        var sql = Sql()
            .Select<DataTypeDto>()
            .AndSelect<NodeDto>()
            .From<DataTypeDto>()
            .InnerJoin<NodeDto>()
            .On<DataTypeDto, NodeDto>(left => left.NodeId, right => right.NodeId)
            .Where<DataTypeDto>(x => mapsEditorIds.Contains(x.NodeId));

        var dataTypeDtos = Database.Fetch<DataTypeDto>(sql);

        foreach (var dataTypeDto in dataTypeDtos)
        {
            logger.LogInformation("Updating EditorUiAlias and EditorAlias for DataTypeId {id}", dataTypeDto.NodeId);
            dataTypeDto.EditorUiAlias = "Our.Umbraco.CdCheckbox";
            dataTypeDto.EditorAlias = "Umbraco.TrueFalse";
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