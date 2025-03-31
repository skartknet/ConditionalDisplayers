import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"]
    },
    outDir: '../App_Plugins/ConditionalDisplayers',
    //outDir: '../../UmbracoV15/wwwroot/App_Plugins/ConditionalDisplayers',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
    emitAssets: true,
    copyPublicDir: true
  },
});
