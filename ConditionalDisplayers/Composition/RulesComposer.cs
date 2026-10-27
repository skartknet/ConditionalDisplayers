using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;
using ConditionalDisplayers.Services;
using ConditionalDisplayers.Rules;
using ConditionalDisplayers.DeliveryAPI;

namespace ConditionalDisplayers.Composition;

internal sealed class RulesComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddSingleton<RulesStore>();
        builder.Services.AddSingleton<VisibilityService>();
        builder.AddBackOfficeOpenApiDocument(RulesController.ApiName, doc => doc.WithTitle("Conditional Displayers API"));

        if (builder.Config.GetValue<bool>("ConditionalDisplayers:DeliveryApi:StripHiddenProperties"))
        {
            Decorate<IApiContentBuilder>(builder.Services, (inner, v) => new StripHiddenContentBuilder(inner, v));
            Decorate<IApiContentResponseBuilder>(builder.Services, (inner, v) => new StripHiddenContentResponseBuilder(inner, v));
            Decorate<IApiElementBuilder>(builder.Services, (inner, v) => new StripHiddenElementBuilder(inner, v));
            Decorate<IApiMediaBuilder>(builder.Services, (inner, v) => new StripHiddenMediaBuilder(inner, v));
        }

        builder
            .AddNotificationHandler<ContentTypeSavedNotification, RulesCleanupHandler>()
            .AddNotificationHandler<MediaTypeSavedNotification, RulesCleanupHandler>()
            .AddNotificationHandler<MemberTypeSavedNotification, RulesCleanupHandler>()
            .AddNotificationHandler<ContentTypeDeletedNotification, RulesCleanupHandler>()
            .AddNotificationHandler<MediaTypeDeletedNotification, RulesCleanupHandler>()
            .AddNotificationHandler<MemberTypeDeletedNotification, RulesCleanupHandler>();
    }

    /// <summary>Wraps whatever is registered for <typeparamref name="T"/> now. Does nothing if nothing is registered.</summary>
    private static void Decorate<T>(IServiceCollection services, Func<T, VisibilityService, T> wrap) where T : class
    {
        var original = services.LastOrDefault(d => d.ServiceType == typeof(T));
        if (original is null) return;

        services.Remove(original);
        services.Add(ServiceDescriptor.Describe(typeof(T), sp =>
        {
            var inner = (T)(original.ImplementationInstance
                ?? original.ImplementationFactory?.Invoke(sp)
                ?? ActivatorUtilities.CreateInstance(sp, original.ImplementationType!));
            return wrap(inner, sp.GetRequiredService<VisibilityService>());
        }, original.Lifetime));
    }
}
