using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.SwaggerGen;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;
#if NET10_0_OR_GREATER
using Microsoft.OpenApi;
#else
using Microsoft.OpenApi.Models;
#endif

namespace ConditionalDisplayers.Rules;

internal sealed class RulesComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddSingleton<RulesStore>();
        builder.Services.ConfigureOptions<SwaggerConfig>();

        builder
            .AddNotificationHandler<ContentTypeSavedNotification, RulesCleanupHandler>()
            .AddNotificationHandler<MediaTypeSavedNotification, RulesCleanupHandler>()
            .AddNotificationHandler<MemberTypeSavedNotification, RulesCleanupHandler>()
            .AddNotificationHandler<ContentTypeDeletedNotification, RulesCleanupHandler>()
            .AddNotificationHandler<MediaTypeDeletedNotification, RulesCleanupHandler>()
            .AddNotificationHandler<MemberTypeDeletedNotification, RulesCleanupHandler>();
    }

    private sealed class SwaggerConfig : IConfigureOptions<SwaggerGenOptions>
    {
        public void Configure(SwaggerGenOptions options) =>
            options.SwaggerDoc(RulesController.ApiName, new OpenApiInfo
            {
                Title = "Conditional Displayers API",
                Version = "Latest",
            });
    }
}
