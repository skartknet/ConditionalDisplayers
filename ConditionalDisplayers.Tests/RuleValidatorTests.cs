using System.Text.Json;
using ConditionalDisplayers.Rules;

namespace ConditionalDisplayers.Tests;

public class RuleValidatorTests
{
    private static Condition C(string op, string? connector = null) =>
        new() { PropertyKey = Guid.NewGuid(), Operator = op, Connector = connector };

    [Fact]
    public void Empty_rule_set_is_valid_and_empty()
    {
        var rules = new RuleSet();
        Assert.Null(RuleValidator.Validate(rules));
        Assert.True(rules.IsEmpty);
    }

    [Fact]
    public void Rule_set_with_any_condition_is_not_empty()
    {
        Assert.False(new RuleSet { Hide = [C("isEmpty")] }.IsEmpty);
        Assert.False(new RuleSet { Show = [C("isTicked")] }.IsEmpty);
    }

    [Theory]
    [InlineData("isTicked")]
    [InlineData("isNotTicked")]
    [InlineData("anyOf")]
    [InlineData("noneOf")]
    [InlineData("equals")]
    [InlineData("notEquals")]
    [InlineData("contains")]
    [InlineData("isEmpty")]
    [InlineData("isNotEmpty")]
    [InlineData("eq")]
    [InlineData("neq")]
    [InlineData("gt")]
    [InlineData("lt")]
    [InlineData("gte")]
    [InlineData("lte")]
    public void Known_operators_are_accepted(string op) =>
        Assert.Null(RuleValidator.Validate(new RuleSet { Show = [C(op)] }));

    [Theory]
    [InlineData("")]
    [InlineData("IsTicked")]
    [InlineData("drop table")]
    public void Unknown_operators_are_rejected(string op) =>
        Assert.NotNull(RuleValidator.Validate(new RuleSet { Hide = [C(op)] }));

    [Fact]
    public void First_condition_cannot_have_a_connector() =>
        Assert.NotNull(RuleValidator.Validate(new RuleSet { Show = [C("isTicked", "and")] }));

    [Theory]
    [InlineData(null)]
    [InlineData("xor")]
    [InlineData("AND")]
    public void Later_conditions_need_a_valid_connector(string? connector) =>
        Assert.NotNull(RuleValidator.Validate(new RuleSet { Show = [C("isTicked"), C("isEmpty", connector)] }));

    [Fact]
    public void Later_conditions_accept_and_or()
    {
        var rules = new RuleSet { Show = [C("isTicked"), C("isEmpty", "and"), C("isNotEmpty", "or")] };
        Assert.Null(RuleValidator.Validate(rules));
    }

    [Fact]
    public void Hide_group_is_validated_too() =>
        Assert.NotNull(RuleValidator.Validate(new RuleSet { Show = [C("isTicked")], Hide = [C("nope")] }));

    [Fact]
    public void Too_many_conditions_are_rejected()
    {
        var group = new List<Condition> { C("isTicked") };
        group.AddRange(Enumerable.Range(0, RuleValidator.MaxConditions).Select(_ => C("isTicked", "and")));
        Assert.NotNull(RuleValidator.Validate(new RuleSet { Show = group }));
    }

    [Fact]
    public void Rules_round_trip_as_camel_case_json()
    {
        var json = """
            {"show":[{"propertyKey":"3f2504e0-4f89-41d3-9a0c-0305e82c3301","operator":"anyOf","value":["a","b"]},
                     {"connector":"and","propertyKey":"3f2504e0-4f89-41d3-9a0c-0305e82c3302","operator":"isTicked"}],
             "hide":[]}
            """;
        var rules = JsonSerializer.Deserialize<RuleSet>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web))!;

        Assert.Equal(2, rules.Show.Count);
        Assert.Equal("anyOf", rules.Show[0].Operator);
        Assert.Equal(2, rules.Show[0].Value!.Value.GetArrayLength());
        Assert.Equal("and", rules.Show[1].Connector);
        Assert.Null(RuleValidator.Validate(rules));
    }
}
