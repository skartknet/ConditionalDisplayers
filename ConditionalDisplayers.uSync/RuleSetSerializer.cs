using System.Xml.Linq;
using ConditionalDisplayers.Rules;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Services;
using uSync.Core;
using uSync.Core.Extensions;
using uSync.Core.Models;
using uSync.Core.Serialization;

namespace ConditionalDisplayers.USync;

[SyncSerializer("8F2D3C1E-5B7A-4E0C-9A64-2C1D7E5B9F30", "Conditional Displayers rules serializer", RuleSetXml.ItemType, IsTwoPass = false)]
public sealed class RuleSetSerializer(IEntityService entityService, ILogger<SyncSerializerBase<RuleSetEntity>> logger, RulesStore store)
    : SyncSerializerBase<RuleSetEntity>(entityService, logger), ISyncSerializer<RuleSetEntity>
{
    public override Task<RuleSetEntity?> FindItemAsync(Guid key) =>
        Task.FromResult<RuleSetEntity?>(new RuleSetEntity(key, store.Get([key])));

    public override Task<RuleSetEntity?> FindItemAsync(string alias) =>
        Guid.TryParse(alias, out var key) ? FindItemAsync(key) : Task.FromResult<RuleSetEntity?>(null);

    public override Task SaveItemAsync(RuleSetEntity item)
    {
        store.Replace(item.Key, item.Rows.ToList());
        return Task.CompletedTask;
    }

    public override Task DeleteItemAsync(RuleSetEntity item)
    {
        store.Replace(item.Key, []);
        return Task.CompletedTask;
    }

    public override string ItemAlias(RuleSetEntity item) => item.Key.ToString();

    protected override Task<SyncAttempt<XElement>> SerializeCoreAsync(RuleSetEntity item, SyncSerializerOptions options)
    {
        var node = InitializeBaseNode(item, ItemAlias(item));
        node.Add(new XElement("Name", entityService.Get(item.Key)?.Name));
        node.Add(RuleSetXml.Write(item.Rows));
        return Task.FromResult(SyncAttempt<XElement>.Succeed(ItemAlias(item), node, typeof(RuleSetEntity), ChangeType.Export));
    }

    protected override Task<SyncAttempt<RuleSetEntity>> DeserializeCoreAsync(XElement node, SyncSerializerOptions options)
    {
        var key = node.GetKey();
        var item = new RuleSetEntity(key, RuleSetXml.Read(key, node));
        return Task.FromResult(SyncAttempt<RuleSetEntity>.Succeed(node.GetAlias(), item, ChangeType.Import, new List<uSyncChange>()));
    }
}
