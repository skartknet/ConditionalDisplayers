using ConditionalDisplayers.Migrations.Install;
using ConditionalDisplayers.Migrations.Upgrade;
using Umbraco.Cms.Core.Packaging;

namespace ConditionalDisplayers.Migrations;

internal sealed class MigrationPlan() : PackageMigrationPlan("ConditionalDisplayers")
{
    public override string InitialState => "{conditionaldisplayers-init-state}";

    protected override void DefinePlan()
    {
        From(InitialState)
            .To<RegisterUmbracoPackageEntry>(RegisterUmbracoPackageEntry.State)            
            .To<MigrateDataTypes>(MigrateDataTypes.LegacyState)
            .To<MigrateDataTypes>(MigrateDataTypes.State)
            .To<AddRuleTable>(AddRuleTable.State)
            .To<ConvertLegacyConfig>(ConvertLegacyConfig.State);
    }
}