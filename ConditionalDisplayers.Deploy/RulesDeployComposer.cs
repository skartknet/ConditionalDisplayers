using ConditionalDisplayers.Rules;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;
using Umbraco.Deploy.Core;
using Umbraco.Deploy.Infrastructure.Disk;
using Umbraco.Extensions;

namespace ConditionalDisplayers.Deploy;

internal sealed class RulesDeployComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        UdiParser.RegisterUdiType(RulesDeployConstants.EntityType, UdiType.GuidUdi);
        builder
            .AddNotificationHandler<UmbracoApplicationStartingNotification, RulesDeployStartingHandler>()
            .AddNotificationAsyncHandler<RulesSavedNotification, RulesSavedDeployHandler>();
    }
}

/// <summary>Rules are schema, so they travel as disk artifacts (.uda files), like document types.</summary>
internal sealed class RulesDeployStartingHandler(IRuntimeState runtimeState, IDiskEntityService diskEntityService)
    : INotificationHandler<UmbracoApplicationStartingNotification>
{
    public void Handle(UmbracoApplicationStartingNotification notification)
    {
        if (runtimeState.Level == RuntimeLevel.Run) diskEntityService.RegisterDiskEntityType(RulesDeployConstants.EntityType);
    }
}

/// <summary>Writes the .uda file and refreshes the signature when rules are saved.</summary>
internal sealed class RulesSavedDeployHandler(RulesConnector connector, IDiskEntityService diskEntityService, ISignatureService signatureService)
    : INotificationAsyncHandler<RulesSavedNotification>
{
    public async Task HandleAsync(RulesSavedNotification notification, CancellationToken cancellationToken)
    {
        var udi = new GuidUdi(RulesDeployConstants.EntityType, notification.ContentTypeKey).EnsureClosed();
        var artifact = await connector.GetArtifactAsync(udi, new DictionaryCache(), cancellationToken);
        if (artifact is null) return;
        await diskEntityService.WriteArtifactsAsync([artifact], cancellationToken);
        signatureService.SetSignatures([artifact]);
    }
}
