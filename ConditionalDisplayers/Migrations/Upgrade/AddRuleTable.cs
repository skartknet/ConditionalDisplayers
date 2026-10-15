using ConditionalDisplayers.Rules;
using Umbraco.Cms.Infrastructure.Migrations;

namespace ConditionalDisplayers.Migrations.Upgrade;

internal sealed class AddRuleTable(IMigrationContext context) : AsyncMigrationBase(context)
{
    public const string State = "{conditionaldisplayers-add-rule-table}";

    protected override Task MigrateAsync()
    {
        if (!TableExists(RuleDto.TableName))
        {
            Create.Table<RuleDto>().Do();
        }

        return Task.CompletedTask;
    }
}
