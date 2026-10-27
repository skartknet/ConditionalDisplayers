using ConditionalDisplayers.Rules;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using uSync.BackOffice;

namespace ConditionalDisplayers.USync;

[ComposeBefore(typeof(uSyncBackOfficeComposer))]
internal sealed class RuleSetComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder) =>
        builder.AddNotificationAsyncHandler<RulesSavedNotification, RuleSetHandler>();
}
