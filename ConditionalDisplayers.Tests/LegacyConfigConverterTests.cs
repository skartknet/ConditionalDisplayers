using System.Text.Json.Nodes;
using ConditionalDisplayers.Migrations.Upgrade;
using ConditionalDisplayers.Rules;

namespace ConditionalDisplayers.Tests;

public class LegacyConfigConverterTests
{
    private static readonly Guid Source = Guid.NewGuid();
    private static readonly Guid A = Guid.NewGuid();
    private static readonly Guid B = Guid.NewGuid();
    private static readonly Guid C = Guid.NewGuid();

    private static IReadOnlyCollection<Guid> Resolve(string alias) => alias switch
    {
        "a" => [A],
        "b" => [B],
        "group:g" => [B, C],
        _ => [],
    };

    private static (Dictionary<Guid, RuleSet> Rules, List<string> Skipped) Run(LegacyKind kind, string json, Guid? source = null)
    {
        var rules = new Dictionary<Guid, RuleSet>();
        var skipped = new List<string>();
        LegacyConfigConverter.Convert(source ?? Source, kind, JsonNode.Parse(json)!.AsObject(), Resolve, rules, skipped.Add);
        return (rules, skipped);
    }

    [Fact]
    public void Checkbox_checked_list_shows_when_ticked_and_hides_when_not()
    {
        var (rules, _) = Run(LegacyKind.Checkbox, """{"showIfChecked":"a"}""");

        Assert.Equal(["isTicked"], rules[A].Show.Select(c => c.Operator));
        Assert.Equal(["isNotTicked"], rules[A].Hide.Select(c => c.Operator));
    }

    [Fact]
    public void Checkbox_unchecked_list_is_the_reverse()
    {
        var (rules, _) = Run(LegacyKind.Checkbox, """{"showIfUnchecked":"a"}""");

        Assert.Equal(["isNotTicked"], rules[A].Show.Select(c => c.Operator));
        Assert.Equal(["isTicked"], rules[A].Hide.Select(c => c.Operator));
    }

    [Fact]
    public void Property_prefix_is_stripped_and_groups_expand()
    {
        var (rules, skipped) = Run(LegacyKind.Checkbox, """{"showIfChecked":"property:a, group:g"}""");

        Assert.Equal(new[] { A, B, C }.Order(), rules.Keys.Order());
        Assert.Empty(skipped);
    }

    [Fact]
    public void Unknown_aliases_are_skipped_and_reported()
    {
        var (rules, skipped) = Run(LegacyKind.Checkbox, """{"showIfChecked":"nope,a"}""");

        Assert.Equal(["nope"], skipped);
        Assert.Equal([A], rules.Keys);
    }

    [Fact]
    public void List_items_become_one_any_of_condition_per_target()
    {
        var (rules, _) = Run(LegacyKind.List, """
            {"items":[
              {"key":"x","show":"a","hide":"b"},
              {"key":"y","show":"a,b","hide":""},
              {"key":"z","hide":"a"}]}
            """);

        var show = Assert.Single(rules[A].Show);
        Assert.Equal("anyOf", show.Operator);
        Assert.Equal(["x", "y"], show.Value!.Value.EnumerateArray().Select(e => e.GetString()));
        Assert.Equal(["z"], Assert.Single(rules[A].Hide).Value!.Value.EnumerateArray().Select(e => e.GetString()));
        Assert.Equal(["x"], Assert.Single(rules[B].Hide).Value!.Value.EnumerateArray().Select(e => e.GetString()));
    }

    [Fact]
    public void Sources_driving_the_same_target_are_joined_with_or()
    {
        var other = Guid.NewGuid();
        var rules = new Dictionary<Guid, RuleSet>();
        var config = JsonNode.Parse("""{"showIfChecked":"a"}""")!.AsObject();
        LegacyConfigConverter.Convert(Source, LegacyKind.Checkbox, config, Resolve, rules, _ => { });
        LegacyConfigConverter.Convert(other, LegacyKind.Checkbox, config, Resolve, rules, _ => { });

        Assert.Equal([null, "or"], rules[A].Show.Select(c => c.Connector));
        Assert.Equal([Source, other], rules[A].Show.Select(c => c.PropertyKey));
    }

    [Fact]
    public void StripConfig_removes_old_keys_and_keeps_the_rest()
    {
        var list = JsonNode.Parse("""{"default":"x","items":[{"key":"x","value":"X","show":"a","hide":"b"}]}""")!.AsObject();
        Assert.True(LegacyConfigConverter.StripConfig(LegacyKind.List, list));
        Assert.Equal("""{"default":"x","items":[{"key":"x","value":"X"}]}""", list.ToJsonString());

        var box = JsonNode.Parse("""{"showIfChecked":"a","labelOn":"Yes"}""")!.AsObject();
        Assert.True(LegacyConfigConverter.StripConfig(LegacyKind.Checkbox, box));
        Assert.Equal("""{"labelOn":"Yes"}""", box.ToJsonString());
        Assert.False(LegacyConfigConverter.StripConfig(LegacyKind.Checkbox, box));
    }
}
