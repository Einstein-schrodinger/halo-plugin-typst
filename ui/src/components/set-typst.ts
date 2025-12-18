// 防止在热模块替换(HMR)期间重新初始化编译器和渲染器选项。
// 使用prepareUseOnce标志确保初始化只发生一次，以避免重复调用setXXXInitOptions。
import { $typst } from '@myriaddreamin/typst.ts';
import { preloadFontAssets } from '@myriaddreamin/typst.ts/options.init'

let initialized = false;
export default () => {
  if(!initialized) {
    $typst.setCompilerInitOptions({
      beforeBuild: [
        preloadFontAssets({
          assets: ['text', 'cjk', 'emoji'], // 加载所有类型的默认字体
        }),
      ],
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