using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;

namespace ConditionalDisplayers.Rules;

/// <summary>Keeps the rule table in step with content, media and member types.</summary>
internal sealed class RulesCleanupHandler(RulesStore store) :
    INotificationHandler<ContentTypeSavedNotification>,
    INotificationHandler<MediaTypeSavedNotification>,
    INotificationHandler<MemberTypeSavedNotification>,
    INotificationHandler<ContentTypeDeletedNotification>,
    INotificationHandler<MediaTypeDeletedNotification>,
    INotificationHandler<MemberTypeDeletedNotification>
{
    public void Handle(ContentTypeSavedNotification n) => Saved(n.SavedEntities);
    public void Handle(MediaTypeSavedNotification n) => Saved(n.SavedEntities);
    public void Handle(MemberTypeSavedNotification n) => Saved(n.SavedEntities);
    public void Handle(ContentTypeDeletedNotification n) => Deleted(n.DeletedEntities);
    public void Handle(MediaTypeDeletedNotification n) => Deleted(n.DeletedEntities);
    public void Handle(MemberTypeDeletedNotification n) => Deleted(n.DeletedEntities);

    private void Saved(IEnumerable<IContentTypeBase> types)
    {
        foreach (var t in types)
        {
            store.Prune(t.Key, t.PropertyTypes.Select(p => p.Key).ToArray());
        }
    }

    private void Deleted(IEnumerable<IContentTypeBase> types)
    {
        foreach (var t in types)
        {
            store.Prune(t.Key, []);
        }
    }
}
