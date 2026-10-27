using ConditionalDisplayers.Rules;
using NSubstitute;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;

namespace ConditionalDisplayers.Tests;

public class RulesCleanupHandlerTests
{
    private static (T Type, Guid Key, Guid[] Props) FakeType<T>() where T : class, IContentTypeBase
    {
        var props = new[] { Guid.NewGuid(), Guid.NewGuid() };
        var type = Substitute.For<T>();
        var typeKey = Guid.NewGuid();
        type.Key.Returns(typeKey);
        var propTypes = props.Select(k =>
        {
            var p = Substitute.For<IPropertyType>();
            p.Key.Returns(k);
            return p;
        }).ToList();
        type.PropertyTypes.Returns(propTypes);
        return (type, typeKey, props);
    }

    private static void AssertPrunedTo(TestScope t, Guid typeKey, Guid[] live) =>
        t.Db.Received(1).Execute(
            Arg.Is<string>(s => s.Contains("NOT IN")),
            Arg.Is<object[]>(a => (Guid)a[0] == typeKey && ((Guid[])a[1]).SequenceEqual(live)));

    private static void AssertAllDeleted(TestScope t, Guid typeKey) =>
        t.Db.Received(1).Execute(
            Arg.Is<string>(s => !s.Contains("NOT IN")),
            Arg.Is<object[]>(a => a.Length == 1 && (Guid)a[0] == typeKey));

    [Fact]
    public void Saved_document_type_prunes_to_its_own_properties()
    {
        var t = new TestScope();
        var (type, key, props) = FakeType<IContentType>();

        new RulesCleanupHandler(t.Store).Handle(new ContentTypeSavedNotification(type, new EventMessages()));

        AssertPrunedTo(t, key, props);
    }

    [Fact]
    public void Saved_media_type_prunes_to_its_own_properties()
    {
        var t = new TestScope();
        var (type, key, props) = FakeType<IMediaType>();

        new RulesCleanupHandler(t.Store).Handle(new MediaTypeSavedNotification(type, new EventMessages()));

        AssertPrunedTo(t, key, props);
    }

    [Fact]
    public void Saved_member_type_prunes_to_its_own_properties()
    {
        var t = new TestScope();
        var (type, key, props) = FakeType<IMemberType>();

        new RulesCleanupHandler(t.Store).Handle(new MemberTypeSavedNotification(type, new EventMessages()));

        AssertPrunedTo(t, key, props);
    }

    [Fact]
    public void Deleted_document_type_removes_all_its_rules()
    {
        var t = new TestScope();
        var (type, key, _) = FakeType<IContentType>();

        new RulesCleanupHandler(t.Store).Handle(new ContentTypeDeletedNotification(type, new EventMessages()));

        AssertAllDeleted(t, key);
    }

    [Fact]
    public void Deleted_media_type_removes_all_its_rules()
    {
        var t = new TestScope();
        var (type, key, _) = FakeType<IMediaType>();

        new RulesCleanupHandler(t.Store).Handle(new MediaTypeDeletedNotification(type, new EventMessages()));

        AssertAllDeleted(t, key);
    }

    [Fact]
    public void Deleted_member_type_removes_all_its_rules()
    {
        var t = new TestScope();
        var (type, key, _) = FakeType<IMemberType>();

        new RulesCleanupHandler(t.Store).Handle(new MemberTypeDeletedNotification(type, new EventMessages()));

        AssertAllDeleted(t, key);
    }

    [Fact]
    public void Saved_type_with_no_properties_removes_all_its_rules()
    {
        var t = new TestScope();
        var type = Substitute.For<IContentType>();
        type.Key.Returns(Guid.NewGuid());
        type.PropertyTypes.Returns([]);

        new RulesCleanupHandler(t.Store).Handle(new ContentTypeSavedNotification(type, new EventMessages()));

        AssertAllDeleted(t, type.Key);
    }
}
