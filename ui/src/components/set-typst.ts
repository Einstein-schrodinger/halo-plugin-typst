// 防止在热模块替换(HMR)期间重新初始化编译器和渲染器选项。
// 使用prepareUseOnce标志确保初始化只发生一次，以避免重复调用setXXXInitOptions。
import { $typst } from '@myriaddreamin/typst.ts';
import { type LoadRemoteFontsOptions, loadFonts } from '@myriaddreamin/typst.ts/options.init';
import { getTypstFontUrl } from '@/utils';

let initialized = false;
// 默认加载的字体，cjk使用Google与Adobe推出的思源宋体，默认值的cjk字体库不全
// assets: ['text', 'cjk', 'emoji']
const loaLoadRemoteFontsOptions:LoadRemoteFontsOptions = {
  assets: ['text', 'emoji'],
}

export default async () => {
  const typstFontUrl = await getTypstFontUrl();
  const typstFontUrls = [
    typstFontUrl
  ];
  if(!initialized) {
    $typst.setCompilerInitOptions({
      beforeBuild: [
        loadFonts(typstFontUrls, loaLoadRemoteFontsOptions),
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