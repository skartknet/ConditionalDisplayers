using ConditionalDisplayers.Rules;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Strings;
using uSync.BackOffice;
using uSync.BackOffice.Configuration;
using uSync.BackOffice.Services;
using uSync.BackOffice.SyncHandlers;
using uSync.BackOffice.SyncHandlers.Interfaces;
using uSync.BackOffice.SyncHandlers.Models;
using uSync.Core;

namespace ConditionalDisplayers.USync;

[SyncHandler("ConditionalDisplayersRulesHandler", "Conditional Displayers Rules", "ConditionalDisplayers", 1270,
    Icon = "icon-eye", EntityType = EntityTypeName, IsTwoPass = false)]
public sealed class RuleSetHandler(
    ILogger<SyncHandlerRoot<RuleSetEntity, RuleSetEntity>> logger,
    AppCaches appCaches,
    IShortStringHelper shortStringHelper,
    ISyncFileService syncFileService,
    ISyncEventService mutexService,
    ISyncConfigService uSyncConfig,
    ISyncItemFactory itemFactory,
    RulesStore store)
    : SyncHandlerRoot<RuleSetEntity, RuleSetEntity>(logger, appCaches, shortStringHelper, syncFileService, mutexService, uSyncConfig, itemFactory),
      ISyncHandler,
      INotificationAsyncHandler<RulesSavedNotification>
{
    public const string EntityTypeName = "conditionaldisplayers-rules";

    /// <summary>Bridges our notification into uSync's normal 'saved' flow, which exports the item.</summary>
    public Task HandleAsync(RulesSavedNotification notification, CancellationToken cancellationToken) =>
        HandleAsync(
            new RuleSetSavedNotification(new RuleSetEntity(notification.ContentTypeKey, store.Get([notification.ContentTypeKey])), new EventMessages()),
            cancellationToken);

    protected override Task<IEnumerable<uSyncAction>> DeleteMissingItemsAsync(RuleSetEntity parent, IEnumerable<Guid> keysToKeep, bool reportOnly) =>
        Task.FromResult(Enumerable.Empty<uSyncAction>());

    protected override Task<IEnumerable<RuleSetEntity>> GetChildItemsAsync(RuleSetEntity? parent)
    {
        if (parent is not null) return Task.FromResult(Enumerable.Empty<RuleSetEntity>());
        var keys = store.GetContentTypeKeys();
        var byType = store.Get(keys).ToLookup(r => r.ContentTypeKey);
        return Task.FromResult(keys.Select(k => new RuleSetEntity(k, byType[k].ToList())));
    }

    protected override Task<IEnumerable<RuleSetEntity>> GetFoldersAsync(RuleSetEntity? parent) =>
        Task.FromResult(Enumerable.Empty<RuleSetEntity>());

    protected override Task<RuleSetEntity?> GetFromServiceAsync(RuleSetEntity? item) =>
        Task.FromResult(item is null ? null : new RuleSetEntity(item.Key, store.Get([item.Key])));

    protected override string GetItemName(RuleSetEntity item) => item.Key.ToString();
}

public sealed class RuleSetSavedNotification(RuleSetEntity entity, EventMessages messages)
    : SavedNotification<RuleSetEntity>(entity, messages);
