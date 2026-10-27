using ConditionalDisplayers.Rules;
using ConditionalDisplayers.Services;
using NSubstitute;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services;

namespace ConditionalDisplayers.Tests;

public class VisibilityServiceTests
{
    private readonly Guid _typeKey = Guid.NewGuid();
    private readonly Guid _source = Guid.NewGuid(), _target = Guid.NewGuid(), _mandatory = Guid.NewGuid();
    private readonly TestScope _db = new();
    private readonly VisibilityService _service;
    private readonly IPublishedContentType _type = Substitute.For<IPublishedContentType>();

    public VisibilityServiceTests()
    {
        _type.Key.Returns(_typeKey);
        _type.ItemType.Returns(PublishedItemType.Content);

        IPropertyType Prop(Guid key, string alias, bool mandatory)
        {
            var p = Substitute.For<IPropertyType>();
            p.Key.Returns(key);
            p.Alias.Returns(alias);
            p.Mandatory.Returns(mandatory);
            return p;
        }

        var definition = Substitute.For<IContentType>();
        var props = new[] { Prop(_source, "source", false), Prop(_target, "target", false), Prop(_mandatory, "must", true) };
        definition.CompositionPropertyTypes.Returns(props);
        var contentTypes = Substitute.For<IContentTypeService>();
        contentTypes.Get(_typeKey).Returns(definition);

        string Rule(Guid prop) => $$"""{"show":[{"propertyKey":"{{_source}}","operator":"isTicked"}],"hide":[]}""";
        var rows = new List<RuleDto>
        {
            new() { PropertyTypeKey = _target, ContentTypeKey = _typeKey, Rules = Rule(_target) },
            new() { PropertyTypeKey = _mandatory, ContentTypeKey = _typeKey, Rules = Rule(_mandatory) },
        };
        _db.Db.Fetch<RuleDto>(Arg.Any<string>(), Arg.Any<object[]>()).Returns(rows);

        _service = new VisibilityService(_db.Store, contentTypes, Substitute.For<IMediaTypeService>(), Substitute.For<IMemberTypeService>());
    }

    private IPublishedElement Element(bool? ticked)
    {
        var element = Substitute.For<IPublishedElement>();
        element.ContentType.Returns(_type);
        element.GetProperty(Arg.Any<string>()).Returns((IPublishedProperty?)null); // NSubstitute would otherwise auto-mock one
        if (ticked is { } value)
        {
            var property = Substitute.For<IPublishedProperty>();
            property.GetValue(null, null).Returns(value);
            element.GetProperty("source").Returns(property);
        }
        return element;
    }

    [Fact]
    public void Shows_the_target_when_the_source_matches_and_hides_it_when_not()
    {
        Assert.True(_service.IsVisible(Element(true), "target"));
        Assert.False(_service.IsVisible(Element(false), "target"));
        Assert.Equal(["target"], _service.GetHiddenAliases(Element(false)));
        Assert.Empty(_service.GetHiddenAliases(Element(true)));
    }

    [Fact]
    public void Ignores_rules_on_mandatory_properties_and_properties_without_rules()
    {
        Assert.True(_service.IsVisible(Element(false), "must"));
        Assert.True(_service.IsVisible(Element(false), "source"));
        Assert.True(_service.IsVisible(Element(false), "unknown"));
    }

    [Fact]
    public void Drops_a_source_the_element_does_not_have()
    {
        Assert.True(_service.IsVisible(Element(null), "target"));
    }

    [Fact]
    public void Reads_rules_once_until_the_store_changes()
    {
        _service.IsVisible(Element(true), "target");
        _service.IsVisible(Element(false), "target");
        _db.Db.Received(1).Fetch<RuleDto>(Arg.Any<string>(), Arg.Any<object[]>());

        _db.Store.Save(_typeKey, []);
        _service.IsVisible(Element(true), "target");
        _db.Db.Received(2).Fetch<RuleDto>(Arg.Any<string>(), Arg.Any<object[]>());
    }
}
