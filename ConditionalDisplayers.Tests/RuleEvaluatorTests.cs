using System.Text.Json;
using ConditionalDisplayers.Rules;

namespace ConditionalDisplayers.Tests;

/// <summary>Same vectors as Client/src/rules/rules.test.ts. Change one side, change the other.</summary>
public class RuleEvaluatorTests
{
    private static readonly Guid P = Guid.NewGuid();

    private static SourceReader Reader(Dictionary<Guid, object?> values) =>
        k => values.TryGetValue(k, out var v) ? (true, v) : (false, null);

    private static Condition C(Guid key, string op, string? connector = null, object? value = null) => new()
    {
        PropertyKey = key,
        Operator = op,
        Connector = connector,
        Value = value is null ? null : JsonSerializer.SerializeToElement(value),
    };

    private static bool? One(string op, object? value, object? expected) =>
        RuleEvaluator.EvaluateGroup([C(P, op, value: expected)], Reader(new() { [P] = value }));

    [Theory]
    [InlineData("isTicked", true, null, true)]
    [InlineData("isTicked", false, null, false)]
    [InlineData("isTicked", null, null, false)]
    [InlineData("isNotTicked", false, null, true)]
    [InlineData("isNotTicked", true, null, false)]
    [InlineData("anyOf", "a", new[] { "a", "b" }, true)]
    [InlineData("anyOf", "c", new[] { "a", "b" }, false)]
    [InlineData("anyOf", new[] { "c", "b" }, new[] { "a", "b" }, true)]
    [InlineData("anyOf", "", new[] { "a" }, false)]
    [InlineData("noneOf", "c", new[] { "a", "b" }, true)]
    [InlineData("noneOf", "a", new[] { "a", "b" }, false)]
    [InlineData("noneOf", null, new[] { "a" }, true)]
    [InlineData("equals", "Hello", "hello", true)]
    [InlineData("equals", "Hello", "bye", false)]
    [InlineData("notEquals", "Hello", "bye", true)]
    [InlineData("contains", "Hello world", "WORLD", true)]
    [InlineData("contains", "Hello", "x", false)]
    [InlineData("isEmpty", "", null, true)]
    [InlineData("isEmpty", "  ", null, true)]
    [InlineData("isEmpty", new string[0], null, true)]
    [InlineData("isEmpty", null, null, true)]
    [InlineData("isEmpty", 0, null, false)]
    [InlineData("isEmpty", false, null, false)]
    [InlineData("isNotEmpty", "x", null, true)]
    [InlineData("isNotEmpty", "", null, false)]
    [InlineData("eq", 5, 5, true)]
    [InlineData("eq", "5", 5, true)]
    [InlineData("neq", 4, 5, true)]
    [InlineData("gt", 6, 5, true)]
    [InlineData("gt", 5, 5, false)]
    [InlineData("gte", 5, 5, true)]
    [InlineData("lt", 4, 5, true)]
    [InlineData("lte", 5, 5, true)]
    [InlineData("lte", 6, 5, false)]
    public void Operators(string op, object? value, object? expected, bool result) =>
        Assert.Equal(result, One(op, value, expected));

    [Theory]
    [InlineData("eq")]
    [InlineData("neq")]
    [InlineData("gt")]
    [InlineData("lt")]
    [InlineData("gte")]
    [InlineData("lte")]
    public void Number_operators_are_false_for_empty_or_non_numeric_sources(string op)
    {
        Assert.False(One(op, "", 5));
        Assert.False(One(op, "abc", 5));
    }

    [Fact]
    public void Decimals_and_ints_compare_as_numbers()
    {
        Assert.True(One("gte", 2.5m, 2.5));
        Assert.True(One("gt", 3, 2.5));
    }

    private static readonly Guid T = Guid.NewGuid(), F = Guid.NewGuid(), Gone = Guid.NewGuid();
    private static readonly SourceReader Tf = Reader(new() { [T] = true, [F] = false });

    [Fact]
    public void Ands_and_ors()
    {
        Assert.True(RuleEvaluator.EvaluateGroup([C(T, "isTicked")], Tf));
        Assert.False(RuleEvaluator.EvaluateGroup([C(T, "isTicked"), C(F, "isTicked", "and")], Tf));
        Assert.True(RuleEvaluator.EvaluateGroup([C(T, "isTicked"), C(F, "isTicked", "or")], Tf));
        Assert.False(RuleEvaluator.EvaluateGroup([C(F, "isTicked"), C(F, "isTicked", "or")], Tf));
    }

    [Fact]
    public void And_binds_tighter_than_or()
    {
        // T or (F and F)
        Assert.True(RuleEvaluator.EvaluateGroup([C(T, "isTicked"), C(F, "isTicked", "or"), C(F, "isTicked", "and")], Tf));
        // (F and T) or T
        Assert.True(RuleEvaluator.EvaluateGroup([C(F, "isTicked"), C(T, "isTicked", "and"), C(T, "isTicked", "or")], Tf));
        // F or (T and F)
        Assert.False(RuleEvaluator.EvaluateGroup([C(F, "isTicked"), C(T, "isTicked", "or"), C(F, "isTicked", "and")], Tf));
    }

    [Fact]
    public void Missing_sources_are_dropped_not_false()
    {
        var r = Reader(new() { [T] = true });
        Assert.True(RuleEvaluator.EvaluateGroup([C(T, "isTicked"), C(Gone, "isTicked", "and")], r));
        Assert.Null(RuleEvaluator.EvaluateGroup([C(Gone, "isTicked")], r));
        Assert.Null(RuleEvaluator.EvaluateGroup([], r));
        Assert.True(RuleEvaluator.EvaluateGroup([C(Gone, "isTicked"), C(T, "isTicked", "and")], r));
    }

    [Fact]
    public void Drops_a_condition_from_inside_an_and_run_keeping_its_neighbours()
    {
        // A or (B and C), B missing => A or C
        var a = Guid.NewGuid();
        var c = Guid.NewGuid();
        var r = Reader(new() { [a] = false, [c] = true });
        Assert.True(RuleEvaluator.EvaluateGroup([C(a, "isTicked"), C(Gone, "isTicked", "or"), C(c, "isTicked", "and")], r));
    }

    [Fact]
    public void IsVisible_follows_show_hide_rules()
    {
        RuleSet Rules(Condition[] show, Condition[] hide) => new() { Show = [.. show], Hide = [.. hide] };
        var tick = (Guid k) => C(k, "isTicked");

        Assert.True(RuleEvaluator.IsVisible(Rules([], []), Tf));
        Assert.False(RuleEvaluator.IsVisible(Rules([tick(F)], []), Tf));
        Assert.True(RuleEvaluator.IsVisible(Rules([tick(T)], []), Tf));
        Assert.False(RuleEvaluator.IsVisible(Rules([], [tick(T)]), Tf));
        Assert.True(RuleEvaluator.IsVisible(Rules([], [tick(F)]), Tf));
        Assert.False(RuleEvaluator.IsVisible(Rules([tick(T)], [tick(T)]), Tf));
        Assert.True(RuleEvaluator.IsVisible(Rules([tick(Gone)], []), Tf));
        Assert.True(RuleEvaluator.IsVisible(Rules([], [tick(Gone)]), Tf));
    }
}
