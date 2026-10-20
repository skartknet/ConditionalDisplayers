using System.Text.Json;
using System.Xml.Linq;
using ConditionalDisplayers.Deploy;
using ConditionalDisplayers.Rules;
using ConditionalDisplayers.USync;
using NSubstitute;
using Umbraco.Cms.Core;

namespace ConditionalDisplayers.Tests;

public class SyncFormatTests
{
    private static readonly Guid TypeKey = Guid.NewGuid();

    private static RuleRow Row(string op = "anyOf", string connector = "and") => new()
    {
        PropertyTypeKey = Guid.NewGuid(),
        ContentTypeKey = TypeKey,
        Rules = new RuleSet
        {
            Show =
            [
                new Condition { PropertyKey = Guid.NewGuid(), Operator = op, Value = JsonSerializer.SerializeToElement(new[] { "a", "b" }) },
                new Condition { PropertyKey = Guid.NewGuid(), Operator = "isTicked", Connector = connector },
            ],
        },
    };

    private static string Json(RuleSet r) => JsonSerializer.Serialize(r, new JsonSerializerOptions(JsonSerializerDefaults.Web));

    [Fact]
    public void USync_xml_round_trips_rules()
    {
        var rows = new[] { Row(), Row("isTicked", "or") };
        var node = new XElement("Item", RuleSetXml.Write(rows));

        var read = RuleSetXml.Read(TypeKey, node);

        Assert.Equal(rows.Select(r => (r.PropertyTypeKey, Json(r.Rules))).OrderBy(x => x.PropertyTypeKey),
            read.Select(r => (r.PropertyTypeKey, Json(r.Rules))).OrderBy(x => x.PropertyTypeKey));
        Assert.All(read, r => Assert.Equal(TypeKey, r.ContentTypeKey));
    }

    [Fact]
    public void USync_xml_skips_invalid_rules_and_bad_json()
    {
        var node = new XElement("Item",
            new XElement("Rule", new XAttribute("PropertyTypeKey", Guid.NewGuid()), new XCData("not json")),
            new XElement("Rule", new XAttribute("PropertyTypeKey", Guid.NewGuid()), new XCData("""{"show":[{"propertyKey":"00000000-0000-0000-0000-000000000001","operator":"bogus"}],"hide":[]}""")),
            new XElement("Rule", new XAttribute("PropertyTypeKey", "nope"), new XCData("{}")));

        Assert.Empty(RuleSetXml.Read(TypeKey, node));
    }

    [Fact]
    public void Deploy_artifact_round_trips_rules()
    {
        var rows = new[] { Row(), Row("isTicked", "or") };

        var artifact = RulesArtifact.From(new ContentTypeRules(TypeKey, rows), "x", []);
        var back = artifact.ToEntity();

        Assert.Equal(TypeKey, back.Key);
        Assert.Equal(rows.Select(r => (r.PropertyTypeKey, Json(r.Rules))).OrderBy(x => x.PropertyTypeKey),
            back.Rows.Select(r => (r.PropertyTypeKey, Json(r.Rules))).OrderBy(x => x.PropertyTypeKey));
    }

    [Fact]
    public void Deploy_artifact_skips_invalid_rules()
    {
        var artifact = new RulesArtifact(new GuidUdi(RulesDeployConstants.EntityType, TypeKey))
        {
            Rules = { [Guid.NewGuid()] = "garbage" },
        };

        Assert.Empty(artifact.ToEntity().Rows);
    }

    [Fact]
    public void Replace_deletes_rows_not_in_the_new_set()
    {
        var scope = new TestScope();
        var kept = Row();
        var gone = Row();
        scope.Db.Exists<RuleDto>(Arg.Any<object>()).Returns(true);
        scope.Db.Fetch<RuleDto>(Arg.Any<string>(), Arg.Any<object[]>()).Returns(
        [
            new RuleDto { PropertyTypeKey = kept.PropertyTypeKey, ContentTypeKey = TypeKey, Rules = Json(kept.Rules) },
            new RuleDto { PropertyTypeKey = gone.PropertyTypeKey, ContentTypeKey = TypeKey, Rules = Json(gone.Rules) },
        ]);

        scope.Store.Replace(TypeKey, [kept]);

        scope.Db.Received(1).Delete<RuleDto>(gone.PropertyTypeKey);
        scope.Db.Received(1).Update(Arg.Is<RuleDto>(d => d.PropertyTypeKey == kept.PropertyTypeKey));
    }
}
