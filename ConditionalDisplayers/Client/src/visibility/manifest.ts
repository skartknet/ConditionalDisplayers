const typeWorkspaces = ['Umb.Workspace.DocumentType', 'Umb.Workspace.MediaType', 'Umb.Workspace.MemberType'];

export const manifests: Array<UmbExtensionManifest> = [
    {
        type: 'workspaceContext',
        name: 'Conditional Displayers Rules Staging',
        alias: 'Our.Umbraco.ConditionalDisplayers.StagingContext',
        api: () => import('./staging.context'),
        conditions: [{ alias: 'Umb.Condition.WorkspaceAlias', oneOf: typeWorkspaces }],
    },
    {
        type: 'workspaceView',
        name: 'Conditional Displayers Visibility View',
        alias: 'Our.Umbraco.ConditionalDisplayers.VisibilityView',
        element: () => import('./visibility-view.element'),
        weight: 500,
        meta: { label: 'Visibility', pathname: 'visibility', icon: 'icon-eye' },
        conditions: [{ alias: 'Umb.Condition.WorkspaceAlias', match: 'Umb.Workspace.PropertyType' }],
    },
];
