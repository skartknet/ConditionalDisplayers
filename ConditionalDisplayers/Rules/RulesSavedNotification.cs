using Umbraco.Cms.Core.Notifications;

namespace ConditionalDisplayers.Rules;

/// <summary>Published after the rules for a content, media or member type are saved through the API.</summary>
public sealed class RulesSavedNotification(Guid contentTypeKey) : INotification
{
    public Guid ContentTypeKey { get; } = contentTypeKey;
}
