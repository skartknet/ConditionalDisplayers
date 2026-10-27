using ConditionalDisplayers.Rules;
using NSubstitute;

namespace ConditionalDisplayers.Tests;

public class RulesStoreTests
{
    private static RuleSet OneRule() =>
        new() { Show = [new Condition { PropertyKey = Guid.NewGuid(), Operator = "isTicked" }] };

    [Fact]
    public void Get_with_no_keys_does_not_touch_the_database()
    {
        var t = new TestScope();

        Assert.Empty(t.Store.Get([]));

        t.Provider.DidNotReceiveWithAnyArgs().CreateScope();
    }

    [Fact]
    public void Get_maps_rows_and_deserialises_rules()
    {
        var t = new TestScope();
        var dto = new RuleDto
        {
            PropertyTypeKey = Guid.NewGuid(),
            ContentTypeKey = Guid.NewGuid(),
            Rules = """{"show":[],"hide":[{"propertyKey":"3f2504e0-4f89-41d3-9a0c-0305e82c3301","operator":"isEmpty"}]}""",
        };
        t.Db.Fetch<RuleDto>(Arg.Any<string>(), Arg.Any<object[]>()).Returns([dto]);

        var row = Assert.Single(t.Store.Get([dto.ContentTypeKey]));

        Assert.Equal(dto.PropertyTypeKey, row.PropertyTypeKey);
        Assert.Equal(dto.ContentTypeKey, row.ContentTypeKey);
        Assert.Empty(row.Rules.Show);
        Assert.Equal("isEmpty", Assert.Single(row.Rules.Hide).Operator);
    }

    [Fact]
    public void Save_inserts_a_new_row_and_completes_the_scope()
    {
        var t = new TestScope();
        var typeKey = Guid.NewGuid();
        var propKey = Guid.NewGuid();
        t.Db.Exists<RuleDto>(propKey).Returns(false);

        t.Store.Save(typeKey, [new RuleUpdate { PropertyTypeKey = propKey, Rules = OneRule() }]);

        t.Db.Received(1).Insert(Arg.Is<RuleDto>(d =>
            d.PropertyTypeKey == propKey && d.ContentTypeKey == typeKey && d.Rules.Contains("\"operator\":\"isTicked\"")));
        t.Db.DidNotReceive().Update(Arg.Any<RuleDto>());
        t.Scope.Received(1).Complete();
    }

    [Fact]
    public void Save_updates_an_existing_row()
    {
        var t = new TestScope();
        var propKey = Guid.NewGuid();
        t.Db.Exists<RuleDto>(propKey).Returns(true);

        t.Store.Save(Guid.NewGuid(), [new RuleUpdate { PropertyTypeKey = propKey, Rules = OneRule() }]);

        t.Db.Received(1).Update(Arg.Is<RuleDto>(d => d.PropertyTypeKey == propKey));
        t.Db.DidNotReceive().Insert(Arg.Any<RuleDto>());
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void Save_with_null_or_empty_rules_deletes_an_existing_row(bool useNull)
    {
        var t = new TestScope();
        var propKey = Guid.NewGuid();
        t.Db.Exists<RuleDto>(propKey).Returns(true);

        t.Store.Save(Guid.NewGuid(), [new RuleUpdate { PropertyTypeKey = propKey, Rules = useNull ? null : new RuleSet() }]);

        t.Db.Received(1).Delete<RuleDto>(propKey);
        t.Db.DidNotReceive().Insert(Arg.Any<RuleDto>());
        t.Db.DidNotReceive().Update(Arg.Any<RuleDto>());
    }

    [Fact]
    public void Save_with_empty_rules_for_a_missing_row_does_nothing()
    {
        var t = new TestScope();
        var propKey = Guid.NewGuid();
        t.Db.Exists<RuleDto>(propKey).Returns(false);

        t.Store.Save(Guid.NewGuid(), [new RuleUpdate { PropertyTypeKey = propKey, Rules = null }]);

        t.Db.DidNotReceive().Delete<RuleDto>(Arg.Any<object>());
        t.Db.DidNotReceive().Insert(Arg.Any<RuleDto>());
    }

    [Fact]
    public void Save_only_touches_the_properties_it_is_given()
    {
        var t = new TestScope();
        var edited = Guid.NewGuid();

        t.Store.Save(Guid.NewGuid(), [new RuleUpdate { PropertyTypeKey = edited, Rules = OneRule() }]);

        // Upsert per property: no replace-all delete.
        t.Db.DidNotReceiveWithAnyArgs().Execute(Arg.Any<string>(), Arg.Any<object[]>());
    }

    [Fact]
    public void Prune_with_live_properties_deletes_only_the_others()
    {
        var t = new TestScope();
        var typeKey = Guid.NewGuid();
        var live = new[] { Guid.NewGuid(), Guid.NewGuid() };

        t.Store.Prune(typeKey, live);

        t.Db.Received(1).Execute(
            Arg.Is<string>(s => s.Contains("NOT IN")),
            Arg.Is<object[]>(a => (Guid)a[0] == typeKey && ((Guid[])a[1]).SequenceEqual(live)));
        t.Scope.Received(1).Complete();
    }

    [Fact]
    public void Prune_with_no_live_properties_deletes_every_row_for_the_type()
    {
        var t = new TestScope();
        var typeKey = Guid.NewGuid();

        t.Store.Prune(typeKey, []);

        t.Db.Received(1).Execute(
            Arg.Is<string>(s => !s.Contains("NOT IN")),
            Arg.Is<object[]>(a => a.Length == 1 && (Guid)a[0] == typeKey));
    }
}
