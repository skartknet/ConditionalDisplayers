using ConditionalDisplayers.Rules;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.Common.Authorization;

namespace ConditionalDisplayers.Tests;

public class RulesControllerTests
{
    private readonly TestScope _scope = new();
    private readonly IAuthorizationService _auth = Substitute.For<IAuthorizationService>();
    private readonly IContentTypeService _docTypes = Substitute.For<IContentTypeService>();
    private readonly IMediaTypeService _mediaTypes = Substitute.For<IMediaTypeService>();
    private readonly IMemberTypeService _memberTypes = Substitute.For<IMemberTypeService>();
    private readonly IEventAggregator _events = Substitute.For<IEventAggregator>();
    private readonly RulesController _controller;

    public RulesControllerTests()
    {
        Authorise(true);
        _docTypes.Get(Arg.Any<Guid>()).Returns((IContentType?)null);
        _mediaTypes.Get(Arg.Any<Guid>()).Returns((IMediaType?)null);
        _memberTypes.Get(Arg.Any<Guid>()).Returns((IMemberType?)null);
        _controller = new RulesController(_scope.Store, _auth, _docTypes, _mediaTypes, _memberTypes, _events);
    }

    private void Authorise(bool allowed) =>
        _auth.AuthorizeAsync(
                Arg.Any<System.Security.Claims.ClaimsPrincipal>(), Arg.Any<object?>(), Arg.Any<string>())
            .Returns(allowed ? AuthorizationResult.Success() : AuthorizationResult.Failed());

    private static (T Type, Guid PropKey) Type<T>() where T : class, IContentTypeBase
    {
        var propKey = Guid.NewGuid();
        var prop = Substitute.For<IPropertyType>();
        prop.Key.Returns(propKey);
        var type = Substitute.For<T>();
        type.Key.Returns(Guid.NewGuid());
        type.PropertyTypes.Returns([prop]);
        return (type, propKey);
    }

    private static RuleUpdate Valid(Guid propKey) => new()
    {
        PropertyTypeKey = propKey,
        Rules = new RuleSet { Show = [new Condition { PropertyKey = Guid.NewGuid(), Operator = "isTicked" }] },
    };

    private void AssertAuthorisedWith(string policy) =>
        _auth.Received().AuthorizeAsync(
            Arg.Any<System.Security.Claims.ClaimsPrincipal>(), Arg.Any<object?>(), policy);

    [Fact]
    public async Task Put_returns_404_when_no_content_type_matches()
    {
        var result = await _controller.Put(Guid.NewGuid(), []);

        Assert.IsType<NotFoundResult>(result);
        _scope.Db.DidNotReceiveWithAnyArgs().Insert<RuleDto>(default!);
    }

    [Fact]
    public async Task Put_saves_for_a_document_type_using_the_document_type_policy()
    {
        var (type, prop) = Type<IContentType>();
        _docTypes.Get(type.Key).Returns(type);

        var result = await _controller.Put(type.Key, [Valid(prop)]);

        Assert.IsType<OkResult>(result);
        AssertAuthorisedWith(AuthorizationPolicies.TreeAccessDocumentTypes);
        _scope.Db.Received(1).Insert(Arg.Is<RuleDto>(d => d.PropertyTypeKey == prop && d.ContentTypeKey == type.Key));
        await _events.Received(1).PublishAsync(Arg.Is<RulesSavedNotification>(n => n.ContentTypeKey == type.Key));
    }

    [Fact]
    public async Task Put_saves_for_a_media_type_using_the_media_type_policy()
    {
        var (type, prop) = Type<IMediaType>();
        _mediaTypes.Get(type.Key).Returns(type);

        var result = await _controller.Put(type.Key, [Valid(prop)]);

        Assert.IsType<OkResult>(result);
        AssertAuthorisedWith(AuthorizationPolicies.TreeAccessMediaTypes);
    }

    [Fact]
    public async Task Put_saves_for_a_member_type_using_the_member_type_policy()
    {
        var (type, prop) = Type<IMemberType>();
        _memberTypes.Get(type.Key).Returns(type);

        var result = await _controller.Put(type.Key, [Valid(prop)]);

        Assert.IsType<OkResult>(result);
        AssertAuthorisedWith(AuthorizationPolicies.TreeAccessMemberTypes);
    }

    [Fact]
    public async Task Put_is_forbidden_without_the_per_kind_policy()
    {
        var (type, prop) = Type<IContentType>();
        _docTypes.Get(type.Key).Returns(type);
        Authorise(false);

        var result = await _controller.Put(type.Key, [Valid(prop)]);

        Assert.IsType<ForbidResult>(result);
        _scope.Db.DidNotReceiveWithAnyArgs().Insert<RuleDto>(default!);
    }

    [Fact]
    public async Task Put_rejects_a_property_that_is_not_on_the_content_type()
    {
        var (type, _) = Type<IContentType>();
        _docTypes.Get(type.Key).Returns(type);

        var result = await _controller.Put(type.Key, [Valid(Guid.NewGuid())]);

        Assert.IsType<BadRequestObjectResult>(result);
        _scope.Db.DidNotReceiveWithAnyArgs().Insert<RuleDto>(default!);
    }

    [Fact]
    public async Task Put_rejects_invalid_rules_and_saves_nothing()
    {
        var (type, prop) = Type<IContentType>();
        _docTypes.Get(type.Key).Returns(type);
        var bad = new RuleUpdate
        {
            PropertyTypeKey = prop,
            Rules = new RuleSet { Show = [new Condition { PropertyKey = Guid.NewGuid(), Operator = "bogus" }] },
        };

        var result = await _controller.Put(type.Key, [Valid(prop), bad]);

        Assert.IsType<BadRequestObjectResult>(result);
        _scope.Db.DidNotReceiveWithAnyArgs().Insert<RuleDto>(default!);
    }

    [Fact]
    public async Task Put_rejects_oversized_bodies()
    {
        var (type, prop) = Type<IContentType>();
        _docTypes.Get(type.Key).Returns(type);
        var updates = Enumerable.Range(0, RuleValidator.MaxUpdates + 1).Select(_ => Valid(prop)).ToArray();

        var result = await _controller.Put(type.Key, updates);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Put_with_null_rules_deletes_the_row()
    {
        var (type, prop) = Type<IContentType>();
        _docTypes.Get(type.Key).Returns(type);
        _scope.Db.Exists<RuleDto>(prop).Returns(true);

        var result = await _controller.Put(type.Key, [new RuleUpdate { PropertyTypeKey = prop, Rules = null }]);

        Assert.IsType<OkResult>(result);
        _scope.Db.Received(1).Delete<RuleDto>(prop);
    }

    [Fact]
    public void Get_returns_rows_for_the_requested_keys()
    {
        var dto = new RuleDto
        {
            PropertyTypeKey = Guid.NewGuid(),
            ContentTypeKey = Guid.NewGuid(),
            Rules = """{"show":[],"hide":[{"propertyKey":"3f2504e0-4f89-41d3-9a0c-0305e82c3301","operator":"isEmpty"}]}""",
        };
        _scope.Db.Fetch<RuleDto>(Arg.Any<string>(), Arg.Any<object[]>()).Returns([dto]);

        var ok = Assert.IsType<OkObjectResult>(_controller.Get([dto.ContentTypeKey]));

        var rows = Assert.IsAssignableFrom<IReadOnlyList<RuleRow>>(ok.Value);
        Assert.Equal(dto.PropertyTypeKey, Assert.Single(rows).PropertyTypeKey);
    }

    [Fact]
    public void Get_rejects_too_many_keys()
    {
        var keys = Enumerable.Range(0, RuleValidator.MaxUpdates + 1).Select(_ => Guid.NewGuid()).ToArray();

        Assert.IsType<BadRequestObjectResult>(_controller.Get(keys));
    }
}
