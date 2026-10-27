using System.Text.Json;
using Umbraco.Cms.Infrastructure.Scoping;

namespace ConditionalDisplayers.Rules;

public sealed class RulesStore(IScopeProvider scopeProvider)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private long _version;

    /// <summary>Bumped on every write through this store, so in-process caches can tell when they are stale.</summary>
    public long Version => Interlocked.Read(ref _version);

    public IReadOnlyList<RuleRow> Get(IReadOnlyCollection<Guid> contentTypeKeys) =>
        Fetch("ContentTypeKey", contentTypeKeys);

    /// <summary>Rows for the given property types, wherever the owning content type sits in a composition.</summary>
    public IReadOnlyList<RuleRow> GetForProperties(IReadOnlyCollection<Guid> propertyTypeKeys) =>
        Fetch("PropertyTypeKey", propertyTypeKeys);

    private IReadOnlyList<RuleRow> Fetch(string column, IReadOnlyCollection<Guid> keys)
    {
        if (keys.Count == 0) return [];
        using var scope = scopeProvider.CreateScope(autoComplete: true);
        var dtos = scope.Database.Fetch<RuleDto>($"WHERE {column} IN (@0)", keys.ToArray());
        return dtos.Select(d => new RuleRow
        {
            PropertyTypeKey = d.PropertyTypeKey,
            ContentTypeKey = d.ContentTypeKey,
            Rules = JsonSerializer.Deserialize<RuleSet>(d.Rules, Json) ?? new(),
        }).ToList();
    }

    /// <summary>Upsert per property. A null or empty rule set deletes the row.</summary>
    public void Save(Guid contentTypeKey, IEnumerable<RuleUpdate> updates)
    {
        using var scope = scopeProvider.CreateScope();
        foreach (var u in updates)
        {
            var exists = scope.Database.Exists<RuleDto>(u.PropertyTypeKey);
            if (u.Rules is null || u.Rules.IsEmpty)
            {
                if (exists) scope.Database.Delete<RuleDto>(u.PropertyTypeKey);
                continue;
            }

            var dto = new RuleDto
            {
                PropertyTypeKey = u.PropertyTypeKey,
                ContentTypeKey = contentTypeKey,
                Rules = JsonSerializer.Serialize(u.Rules, Json),
            };
            if (exists) scope.Database.Update(dto); else scope.Database.Insert(dto);
        }
        scope.Complete();
        Interlocked.Increment(ref _version);
    }

    /// <summary>Content types that have at least one rule.</summary>
    public IReadOnlyList<Guid> GetContentTypeKeys()
    {
        using var scope = scopeProvider.CreateScope(autoComplete: true);
        return scope.Database.Fetch<Guid>($"SELECT DISTINCT ContentTypeKey FROM {RuleDto.TableName}");
    }

    /// <summary>Makes the stored rules for a type exactly <paramref name="rows"/>, deleting any others (used by sync and deploy imports).</summary>
    public void Replace(Guid contentTypeKey, IReadOnlyCollection<RuleRow> rows)
    {
        var keep = rows.Select(r => r.PropertyTypeKey).ToHashSet();
        var stale = Get([contentTypeKey])
            .Where(r => !keep.Contains(r.PropertyTypeKey))
            .Select(r => new RuleUpdate { PropertyTypeKey = r.PropertyTypeKey, Rules = null });
        Save(contentTypeKey, rows
            .Select(r => new RuleUpdate { PropertyTypeKey = r.PropertyTypeKey, Rules = r.Rules })
            .Concat(stale));
    }

    /// <summary>Deletes rows owned by the type whose property is no longer on it (all rows if it is gone).</summary>
    public void Prune(Guid contentTypeKey, IReadOnlyCollection<Guid> livePropertyKeys)
    {
        using var scope = scopeProvider.CreateScope();
        if (livePropertyKeys.Count == 0)
        {
            scope.Database.Execute($"DELETE FROM {RuleDto.TableName} WHERE ContentTypeKey = @0", contentTypeKey);
        }
        else
        {
            scope.Database.Execute(
                $"DELETE FROM {RuleDto.TableName} WHERE ContentTypeKey = @0 AND PropertyTypeKey NOT IN (@1)",
                contentTypeKey, livePropertyKeys.ToArray());
        }
        scope.Complete();
        Interlocked.Increment(ref _version);
    }
}
