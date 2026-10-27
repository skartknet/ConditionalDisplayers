using ConditionalDisplayers.Rules;
using NSubstitute;
using Umbraco.Cms.Infrastructure.Scoping;
using Umbraco.Cms.Infrastructure.Persistence;

namespace ConditionalDisplayers.Tests;

/// <summary>A mocked scope provider whose scopes all share one mocked database.</summary>
internal sealed class TestScope
{
    public IUmbracoDatabase Db { get; } = Substitute.For<IUmbracoDatabase>();
    public IScope Scope { get; } = Substitute.For<IScope>();
    public IScopeProvider Provider { get; } = Substitute.For<IScopeProvider>();
    public RulesStore Store { get; }

    public TestScope()
    {
        Scope.Database.Returns(Db);
        Provider.CreateScope().ReturnsForAnyArgs(Scope);
        Store = new RulesStore(Provider);
    }
}
