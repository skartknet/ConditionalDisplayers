using Microsoft.AspNetCore.Http;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Management.Controllers;
using Umbraco.Cms.Api.Management.Routing;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Web.Common.Authorization;

namespace ConditionalDisplayers.Rules;

[ApiVersion("1.0")]
[VersionedApiBackOfficeRoute("conditionaldisplayers/rules")]
[MapToApi(ApiName)]
public sealed class RulesController(
    RulesStore store,
    IAuthorizationService authorizationService,
    IContentTypeService contentTypeService,
    IMediaTypeService mediaTypeService,
    IMemberTypeService memberTypeService) : ManagementApiControllerBase
{
    public const string ApiName = "conditionaldisplayers";

    [HttpGet]
    [Authorize(Policy = AuthorizationPolicies.TreeAccessDocumentsOrMediaOrMembersOrContentTypes)]
    [ProducesResponseType<RuleRow[]>(StatusCodes.Status200OK)]
    public IActionResult Get([FromQuery] Guid[] contentTypeKey) =>
        contentTypeKey.Length > RuleValidator.MaxUpdates
            ? BadRequest("Too many keys.")
            : Ok(store.Get(contentTypeKey));

    [HttpPut("{contentTypeKey:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Put(Guid contentTypeKey, [FromBody] RuleUpdate[] updates)
    {
        IContentTypeBase? type = contentTypeService.Get(contentTypeKey);
        var policy = AuthorizationPolicies.TreeAccessDocumentTypes;
        if (type is null)
        {
            type = mediaTypeService.Get(contentTypeKey);
            policy = AuthorizationPolicies.TreeAccessMediaTypes;
        }
        if (type is null)
        {
            type = memberTypeService.Get(contentTypeKey);
            policy = AuthorizationPolicies.TreeAccessMemberTypes;
        }
        if (type is null) return NotFound();

        if (!(await authorizationService.AuthorizeAsync(User, policy)).Succeeded) return Forbid();

        if (updates.Length > RuleValidator.MaxUpdates) return BadRequest("Too many updates.");

        var own = type.PropertyTypes.Select(p => p.Key).ToHashSet();
        foreach (var u in updates)
        {
            if (!own.Contains(u.PropertyTypeKey)) return BadRequest($"Property {u.PropertyTypeKey} does not belong to this content type.");
            if (u.Rules is not null && RuleValidator.Validate(u.Rules) is { } error) return BadRequest(error);
        }

        store.Save(contentTypeKey, updates);
        return Ok();
    }
}
