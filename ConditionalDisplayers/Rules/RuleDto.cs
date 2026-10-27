using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace ConditionalDisplayers.Rules;

[TableName(TableName)]
[PrimaryKey(nameof(PropertyTypeKey), AutoIncrement = false)]
[ExplicitColumns]
internal sealed class RuleDto
{
    public const string TableName = "ConditionalDisplayersRule";

    [Column(nameof(PropertyTypeKey))]
    [PrimaryKeyColumn(AutoIncrement = false)]
    public Guid PropertyTypeKey { get; set; }

    [Column(nameof(ContentTypeKey))]
    [Index(IndexTypes.NonClustered, Name = "IX_" + TableName + "_ContentTypeKey")]
    public Guid ContentTypeKey { get; set; }

    [Column(nameof(Rules))]
    [SpecialDbType(SpecialDbTypes.NVARCHARMAX)]
    public string Rules { get; set; } = string.Empty;
}
