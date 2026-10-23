using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Models.PublishedContent;
using ConditionalDisplayers.Services;

namespace Umbraco.ConditionalDisplayers.Extensions;

public static class PublishedElementExtensions
{
    /// <summary>
    /// True unless the visibility rules hide this property on this item. Works on content, media, members and block elements.
    /// </summary>
    public static bool IsPropertyVisible(this IPublishedElement content, string propertyAlias) =>
        StaticServiceProvider.Instance.GetRequiredService<VisibilityService>().IsVisible(content, propertyAlias);
}
