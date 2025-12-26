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
const compilerUrl = 'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler@0.7.0-rc2/pkg/typst_ts_web_compiler_bg.wasm';
const rendererUrl = 'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer@0.7.0-rc2/pkg/typst_ts_renderer_bg.wasm';

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
      getModule: () => compilerUrl,
    });
  
    $typst.setRendererInitOptions({
      beforeBuild: [],
      getModule: () => rendererUrl,
    });
    initialized = true;
  }
};