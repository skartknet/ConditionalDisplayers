const workspaces = [
    'Umb.Workspace.Document',
    'Umb.Workspace.DocumentBlueprint',
    'Umb.Workspace.Media',
    'Umb.Workspace.Member',
    'Umb.Workspace.Block',
];

export const manifests: Array<UmbExtensionManifest> = [
    {
        type: 'workspaceContext',
        name: 'Conditional Displayers Rules Runtime',
        alias: 'Our.Umbraco.ConditionalDisplayers.RuntimeContext',
        api: () => import('./runtime.context'),
        conditions: [
            {
                alias: 'Umb.Condition.WorkspaceAlias',
                oneOf: workspaces,
            },
        ],
    },
];
