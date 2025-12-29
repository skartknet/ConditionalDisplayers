using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Serialization;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Persistence.Dtos;
using Umbraco.Extensions;

namespace ConditionalDisplayers.Migrations.Upgrade;

internal sealed class MigrateDataTypes(IMigrationContext context, ILogger<MigrateDataTypes> logger) : AsyncMigrationBase(context)
{
    public const string State = "{conditionaldisplayers-migrate-datatypes}";


    private string cdCheckboxAlias = "Our.Umbraco.CdCheckbox";
    private string cdDropdownAlias = "Our.Umbraco.CdDropdownFlexible";
    private string cdRadioAlias = "Our.Umbraco.CdRadio";


    protected override async Task MigrateAsync()
    {

        await MigrateDataType(cdCheckboxAlias, "Umbraco.TrueFalse");
        await MigrateDataType(cdDropdownAlias, "Umbraco.Plain.String");
        await MigrateDataType(cdRadioAlias, "Umbraco.Plain.String");
    }

    private async Task MigrateDataType(string editorUiAlias, string editorAlias)
    {
        var sql = this.Sql()
           .Select<DataTypeDto>()
           .AndSelect<NodeDto>()
           .From<DataTypeDto>()
           .InnerJoin<NodeDto>()
           .On<DataTypeDto, NodeDto>(left => left.NodeId, right => right.NodeId)
           .Where<DataTypeDto>(x => x.EditorUiAlias == editorUiAlias);


        var dataTypeDtos = await Database.FetchAsync<DataTypeDto>(sql);

        foreach (var dataTypeDto in dataTypeDtos)
        {
            logger.LogInformation("Updating EditorUiAlias {editorUiAlias} and EditorAlias {editorAlias}", editorUiAlias, editorAlias);            
            dataTypeDto.EditorAlias = editorAlias;
            _ = Database.Update(dataTypeDto);
        }

    }

}