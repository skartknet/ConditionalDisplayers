using ConditionalDisplayers.Services;
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.Models.DeliveryApi;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace ConditionalDisplayers.DeliveryAPI;

/// <summary>
/// Delivery API decorators that drop the properties the visibility rules hide. Registered only when
/// <c>ConditionalDisplayers:DeliveryApi:StripHiddenProperties</c> is true.
/// Properties are removed after the API item is built, so nested items (block elements, expanded pickers) are covered
/// because they come through these same builders.
/// </summary>
internal static class StripHidden
{
    public static T Strip<T>(VisibilityService visibility, IPublishedElement source, T built, IDictionary<string, object?> properties)
    {
        foreach (var alias in visibility.GetHiddenAliases(source)) properties.Remove(alias);
        return built;
    }
}

internal sealed class StripHiddenContentBuilder(IApiContentBuilder inner, VisibilityService visibility) : IApiContentBuilder
{
    public IApiContent? Build(IPublishedContent content) =>
        inner.Build(content) is { } built ? StripHidden.Strip(visibility, content, built, built.Properties) : null;
}

internal sealed class StripHiddenContentResponseBuilder(IApiContentResponseBuilder inner, VisibilityService visibility) : IApiContentResponseBuilder
{
    public IApiContentResponse? Build(IPublishedContent content) =>
        inner.Build(content) is { } built ? StripHidden.Strip(visibility, content, built, built.Properties) : null;
}

internal sealed class StripHiddenElementBuilder(IApiElementBuilder inner, VisibilityService visibility) : IApiElementBuilder
{
    public IApiElement Build(IPublishedElement element)
    {
        var built = inner.Build(element);
        return StripHidden.Strip(visibility, element, built, built.Properties);
    }
}

internal sealed class StripHiddenMediaBuilder(IApiMediaBuilder inner, VisibilityService visibility) : IApiMediaBuilder
{
    public IApiMedia Build(IPublishedContent media)
    {
        var built = inner.Build(media);
        return StripHidden.Strip(visibility, media, built, built.Properties);
    }
}
