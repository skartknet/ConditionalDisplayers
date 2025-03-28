
const backofficeEntryPoint: UmbExtensionManifest = {
    name: "Conditional Displayers Entrypoint",
    alias: "Our.Umbraco.ConditionalDisplayers.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./backoffice-entrypoint"),
};

// Job of the bundle is to collate all the manifests from different parts of the extension and load other manifests
// We load this bundle from umbraco-package.json
export const manifests: Array<UmbExtensionManifest> = [
    backofficeEntryPoint,
];