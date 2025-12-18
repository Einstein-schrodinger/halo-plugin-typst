package top.sqwfly.typst;

public class TypstJSInjector {
    static String getParsedTypstScript(String typstSelector) {
        String typstScript = """
        <script>
          function previewSvg(selector) {
            const els = document.body.querySelectorAll(selector);
              els.forEach((el) => {
                const typstContent = el.getAttribute('data-content');
                  if (typstContent) {
                    $typst.svg({ mainContent: typstContent }).then(svg => {
                      el.innerHTML = svg;
                    });
                  }
              });
          }
          
          document.getElementById('typst').addEventListener('load', async function () {
            const initOptionsModule = await import('https://cdn.jsdelivr.net/npm/@myriaddreamin/typst.ts@0.7.0-rc1/dist/esm/options.init.mjs');
            $typst.setCompilerInitOptions({
              beforeBuild: [
                initOptionsModule.preloadFontAssets({
                  assets: ['text', 'cjk', 'emoji'],
                }),
              ],
              getModule: () =>
                'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler@0.7.0-rc1/pkg/typst_ts_web_compiler_bg.wasm',
            });
            $typst.setRendererInitOptions({
              getModule: () =>
                'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer@0.7.0-rc1/pkg/typst_ts_renderer_bg.wasm',
            });
            previewSvg('%s');
          });
          </script>
         """;
        return String.format(typstScript, typstSelector);
    }
}