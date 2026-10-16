import { UmbEntryPointOnInit, UmbEntryPointOnUnload } from '@umbraco-cms/backoffice/extension-api';
import { manifests as dataEditorManifests } from './propertyeditors/manifest'
import { manifests as runtimeManifests } from './runtime/manifest'
import { manifests as visibilityManifests } from './visibility/manifest'

// load up the manifests here
export const onInit: UmbEntryPointOnInit = (_host, _extensionRegistry) => {
    const manifests = [...dataEditorManifests, ...runtimeManifests, ...visibilityManifests];

    _extensionRegistry.registerMany(manifests);
};

export const onUnload: UmbEntryPointOnUnload = (_host, _extensionRegistry) => {
    // nothing
};
