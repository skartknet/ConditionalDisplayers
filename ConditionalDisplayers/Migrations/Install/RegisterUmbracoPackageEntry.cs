// Heavily inspired (read: borrowed) from the Contentment Source Code
// https://github.com/leekelleher/umbraco-contentment/blob/dev/v6.x/src/Umbraco.Community.Contentment/Migrations/Install/RegisterUmbracoPackageEntry.cs
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Packaging;

namespace ConditionalDisplayers.Migrations.Install;

internal sealed class RegisterUmbracoPackageEntry(
    IPackagingService packagingService, IMediaService mediaService, MediaFileManager mediaFileManager,
    MediaUrlGeneratorCollection mediaUrlGenerators, IShortStringHelper shortStringHelper,
    IContentTypeBaseServiceProvider contentTypeBaseServiceProvider, IMigrationContext context,
    IOptions<PackageMigrationSettings> packageMigrationsSettings) :
    AsyncPackageMigrationBase(
        packagingService, mediaService, mediaFileManager, mediaUrlGenerators, shortStringHelper,
        contentTypeBaseServiceProvider, context, packageMigrationsSettings)
{

    public const string State = "{conditionaldisplayers-reg-umb-pkg-entry}";    

    protected override async Task MigrateAsync()
    {
        // NOTE: This migration does nothing.
        // By inheriting from `PackageMigrationBase`, the package will be included in the backoffice listing.
        // ref: https://dev.to/kevinjump/put-your-package-in-the-installed-package-list-in-umbraco-9-11cg

        return;
    }
}