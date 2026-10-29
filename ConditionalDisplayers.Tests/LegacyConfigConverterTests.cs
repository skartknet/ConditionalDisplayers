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
        var (rules, _) = Run(LegacyKind.Dropdown, """
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
    public void List_rules_use_the_label_not_the_key()
    {
        var (rules, _) = Run(LegacyKind.Radio, """{"items":[{"key":"x","value":"Show X","show":"a"}]}""");

        Assert.Equal(["Show X"], Assert.Single(rules[A].Show).Value!.Value.EnumerateArray().Select(e => e.GetString()));
    }

    [Fact]
    public void StripConfig_removes_old_checkbox_keys_and_keeps_the_rest()
    {
        var box = JsonNode.Parse("""{"showIfChecked":"a","labelOn":"Yes"}""")!.AsObject();
        Assert.True(LegacyConfigConverter.StripConfig(box));
        Assert.Equal("""{"labelOn":"Yes"}""", box.ToJsonString());
        Assert.False(LegacyConfigConverter.StripConfig(box));
    }

    [Fact]
    public void Core_config_keeps_the_labels_and_maps_keys_to_them()
    {
        var old = JsonNode.Parse("""{"default":"x","items":[{"key":"x","value":"Show X","show":"a"},{"key":"y","value":"Show Y"}]}""")!.AsObject();

        Assert.Equal("""{"items":["Show X","Show Y"]}""", LegacyConfigConverter.CoreConfig(LegacyKind.Radio, old).ToJsonString());
        Assert.Equal("""{"items":["Show X","Show Y"],"multiple":false}""", LegacyConfigConverter.CoreConfig(LegacyKind.Dropdown, old).ToJsonString());
        Assert.Equal("Show Y", LegacyConfigConverter.KeyToLabel(old)["y"]);
    }

    [Fact]
    public void A_composition_source_converted_on_each_type_adds_its_condition_once()
    {
        var rules = new Dictionary<Guid, RuleSet>();
        var config = JsonNode.Parse("""{"showIfChecked":"a"}""")!.AsObject();
        LegacyConfigConverter.Convert(Source, LegacyKind.Checkbox, config, Resolve, rules, _ => { });
        LegacyConfigConverter.Convert(Source, LegacyKind.Checkbox, config, Resolve, rules, _ => { });

        Assert.Equal([Source], rules[A].Show.Select(c => c.PropertyKey));
        Assert.Equal([Source], rules[A].Hide.Select(c => c.PropertyKey));
    }

    private static readonly Guid Element = Guid.NewGuid();

    private static readonly Dictionary<(Guid, string), (Dictionary<string, string>, bool)> Rewrites = new()
    {
        [(Element, "kind")] = (new Dictionary<string, string> { ["x"] = "Show X" }, true),
        [(Element, "choice")] = (new Dictionary<string, string> { ["x"] = "Show X" }, false),
    };

    private static string Block(Guid type, string alias, string value) =>
        $$"""{"contentTypeKey":"{{type}}","key":"{{Guid.NewGuid()}}","values":[{"editorAlias":"Umbraco.Plain.String","alias":"{{alias}}","value":"{{value}}"}]}""";

    [Fact]
    public void Block_values_are_rewritten_from_key_to_label()
    {
        var json = JsonNode.Parse($$"""{"layout":{},"contentData":[{{Block(Element, "kind", "x")}},{{Block(Element, "choice", "x")}}],"settingsData":[]}""");

        Assert.Equal(2, LegacyConfigConverter.RewriteBlockValues(json, Rewrites));
        Assert.Equal("""["Show X"]""", json!["contentData"]![0]!["values"]![0]!["value"]!.GetValue<string>());
        Assert.Equal("Show X", json["contentData"]![1]!["values"]![0]!["value"]!.GetValue<string>());
    }

    [Fact]
    public void Block_values_of_other_types_and_aliases_are_left_alone()
    {
        var json = JsonNode.Parse($$"""{"contentData":[{{Block(Guid.NewGuid(), "kind", "x")}},{{Block(Element, "title", "x")}}]}""");
        var before = json!.ToJsonString();

        Assert.Equal(0, LegacyConfigConverter.RewriteBlockValues(json, Rewrites));
        Assert.Equal(before, json.ToJsonString());
    }

    [Fact]
    public void Nested_block_editor_values_held_as_strings_are_rewritten()
    {
        var inner = $$"""{"contentData":[{{Block(Element, "choice", "x")}}]}""";
        var outer = new JsonObject
        {
            ["contentData"] = new JsonArray(new JsonObject
            {
                ["contentTypeKey"] = Guid.NewGuid().ToString(),
                ["values"] = new JsonArray(new JsonObject { ["alias"] = "blocks", ["value"] = inner }),
            }),
        };

        Assert.Equal(1, LegacyConfigConverter.RewriteBlockValues(outer, Rewrites));
        var nested = JsonNode.Parse(outer["contentData"]![0]!["values"]![0]!["value"]!.GetValue<string>());
        Assert.Equal("Show X", nested!["contentData"]![0]!["values"]![0]!["value"]!.GetValue<string>());
    }

    [Fact]
    public void Rich_text_blocks_are_rewritten()
    {
        var json = JsonNode.Parse($$$"""{"markup":"<p></p>","blocks":{"contentData":[{{{Block(Element, "choice", "x")}}}]}}""");

        Assert.Equal(1, LegacyConfigConverter.RewriteBlockValues(json, Rewrites));
    }
}
