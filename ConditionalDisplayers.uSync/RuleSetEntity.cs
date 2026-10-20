using ConditionalDisplayers.Rules;
using Umbraco.Cms.Core.Models.Entities;

namespace ConditionalDisplayers.USync;

/// <summary>All rules owned by one content, media or member type. uSync handlers need an <see cref="IEntity"/>, so this wraps them.</summary>
public sealed class RuleSetEntity : EntityBase
{
    public RuleSetEntity(Guid contentTypeKey, IReadOnlyList<RuleRow> rows)
    {
        Key = contentTypeKey;
        Rows = rows;
    }

    public IReadOnlyList<RuleRow> Rows { get; }
}
