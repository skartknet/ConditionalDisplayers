using System.Runtime.CompilerServices;
using ConditionalDisplayers.Rules;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Deploy;
using Umbraco.Cms.Core.Services;
using Umbraco.Deploy.Infrastructure.Connectors.ServiceConnectors;

namespace ConditionalDisplayers.Deploy;

[UdiDefinition(RulesDeployConstants.EntityType, UdiType.GuidUdi)]
public sealed class RulesConnector(
    RulesStore store,
    IContentTypeService contentTypeService,
    IMediaTypeService mediaTypeService,
    IMemberTypeService memberTypeService)
    : ServiceConnectorBase<RulesArtifact, GuidUdi, ContentTypeRules>
{
    protected override string[] ValidOpenSelectors { get; } = ["this", "this-and-descendants"];
    protected override string OpenUdiName => "ALL CONDITIONAL DISPLAYERS RULES";
    protected override int[] ProcessPasses { get; } = [0];

    public override Task<RulesArtifact?> GetArtifactAsync(GuidUdi udi, IContextCache contextCache, CancellationToken cancellationToken = default)
    {
        EnsureType(udi);
        return GetArtifactCoreAsync(udi.Guid, contextCache, cancellationToken);
    }

    // The rules entity can be empty (all rules removed). That is still an artifact, so removals deploy too.
    private async Task<RulesArtifact?> GetArtifactCoreAsync(Guid key, IContextCache contextCache, CancellationToken cancellationToken)
    {
        if (OwnerUdi(key) is null) return null;
        return await GetArtifactAsync(new ContentTypeRules(key, store.Get([key])), contextCache, cancellationToken);
    }

    public override Task<RulesArtifact> GetArtifactAsync(ContentTypeRules entity, IContextCache contextCache, CancellationToken cancellationToken = default)
    {
        var owner = OwnerUdi(entity.Key);
        var dependencies = new ArtifactDependencyCollection();
        if (owner is not null) dependencies.Add(new ArtifactDependency(owner, true, ArtifactDependencyMode.Exist));
        return Task.FromResult(RulesArtifact.From(entity, entity.Key.ToString(), dependencies));
    }

    public override Task<ArtifactDeployState<RulesArtifact, ContentTypeRules>> ProcessInitAsync(RulesArtifact artifact, IDeployContext context, CancellationToken cancellationToken = default) =>
        Task.FromResult(CreateInitState(artifact, new ContentTypeRules(artifact.Udi.Guid, store.Get([artifact.Udi.Guid]))));

    public override Task ProcessAsync(ArtifactDeployState<RulesArtifact, ContentTypeRules> state, IDeployContext context, int pass, CancellationToken cancellationToken = default)
    {
        state.NextPass = GetNextPass(pass);
        var incoming = state.Artifact.ToEntity();
        store.Replace(incoming.Key, incoming.Rows.ToList());
        return Task.CompletedTask;
    }

    public override async IAsyncEnumerable<GuidUdi> ExpandRangeAsync(UdiRange range, [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        EnsureRange(range);
        if (range.Udi.IsRoot)
        {
            foreach (var key in store.GetContentTypeKeys()) yield return Udi(key);
            yield break;
        }

        var udi = (GuidUdi)range.Udi;
        if (range.Selector is "this" or "this-and-children" or "this-and-descendants" && OwnerUdi(udi.Guid) is not null)
            yield return udi;
        await Task.CompletedTask;
    }

    public override Task<NamedUdiRange> GetRangeAsync(GuidUdi udi, string selector, CancellationToken cancellationToken = default)
    {
        EnsureType(udi);
        EnsureSelector(udi, selector);
        return Task.FromResult(udi.IsRoot
            ? new NamedUdiRange(udi, OpenUdiName, selector)
            : new NamedUdiRange(udi, udi.Guid.ToString(), selector));
    }

    public override Task<NamedUdiRange> GetRangeAsync(string entityType, string sid, string selector, CancellationToken cancellationToken = default)
    {
        EnsureType(entityType);
        if (Guid.TryParse(sid, out var key)) return GetRangeAsync(Udi(key), selector, cancellationToken);
        if (sid != "-1") throw new ArgumentException("Invalid identifier.", nameof(sid));
        EnsureOpenSelector(selector);
        return Task.FromResult(new NamedUdiRange(Umbraco.Cms.Core.Udi.Create(entityType), OpenUdiName, selector));
    }

    protected override IEnumerable<Difference> GetDifferences(RulesArtifact art1, RulesArtifact art2)
    {
        if (!art1.Rules.SequenceEqual(art2.Rules))
            yield return new Difference("Visibility rules are different.");
    }

    private static GuidUdi Udi(Guid key) => new GuidUdi(RulesDeployConstants.EntityType, key).EnsureClosed();

    /// <summary>The Deploy identifier of the document, media or member type that owns these rules (null if there is none).</summary>
    private GuidUdi? OwnerUdi(Guid key)
    {
        if (contentTypeService.Get(key) is not null) return new GuidUdi(Constants.UdiEntityType.DocumentType, key).EnsureClosed();
        if (mediaTypeService.Get(key) is not null) return new GuidUdi(Constants.UdiEntityType.MediaType, key).EnsureClosed();
        if (memberTypeService.Get(key) is not null) return new GuidUdi(Constants.UdiEntityType.MemberType, key).EnsureClosed();
        return null;
    }
}
