// Prevents reinitialization of compiler and renderer options during HMR (Hot Module Replacement).
// Use prepareUseOnce flag ensures initialization occurs only once to avoid duplicate calls to setXXXInitOptions.
import { $typst } from '@myriaddreamin/typst.ts';

let initialized = false;
export default () => {
  if(!initialized) {
    $typst.setCompilerInitOptions({
      beforeBuild: [],
      getModule: () =>
        new URL(
          '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm',
          import.meta.url
        ).toString(),
    });
  
    $typst.setRendererInitOptions({
      beforeBuild: [],
      getModule: () =>
        new URL(
          '@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm',
          import.meta.url
        ).toString(),
    });
    initialized = true;
  }
};