package top.sqwfly.typst;

public class TypstJSInjector {
    static String getParsedTypstScript(String typstSelector, String typstFontUrl) {
        String typstScript = """
        <script type="module">
          // 等待 Typst 加载完成
          async function waitForTypst() {
            if (window.$typst) {
              return window.$typst;
            }
            return new Promise((resolve) => {
              const checkTypst = () => {
                if (window.$typst) {
                  resolve(window.$typst);
                } else {
                  setTimeout(checkTypst, 100);
                }
              };
              checkTypst();
            });
          }
          
          // Typst 渲染
          async function previewSvg(selector, $typst) {
            const els = document.body.querySelectorAll(selector);
            for (const el of els) {
              const typstContent = el.getAttribute('data-content');
              if (typstContent) {
                try {
                  // 导入资源映射器
                  const { processTypstResources } = await import('/plugins/plugin-typst/assets/static/typst-resource-mapper.js');
                  // 处理资源映射
                  const resourceResult = await processTypstResources(typstContent); 
                  // 渲染 SVG
                  const svg = await $typst.svg({ 
                    mainContent: resourceResult.processedCode 
                  });
                  el.innerHTML = svg;
                } catch (error) {
                  console.error('Failed to render Typst content:', error);
                }
              }
            }
          }

          // 初始化 Typst 渲染
          async function initTypstRendering() {
            try {
              // 等待 Typst 加载
              const $typst = await waitForTypst();
              // 导入初始化模块
              const initOptionsModule = await import('https://cdn.jsdelivr.net/npm/@myriaddreamin/typst.ts@0.7.0-rc2/dist/esm/options.init.mjs');
              const loadRemoteFontsOptions = {
                assets: ['text', 'emoji'],
              };
              const typstFontUrls = [
                '%s',
              ];
              // 设置编译器初始化选项
              $typst.setCompilerInitOptions({
                beforeBuild: [
                  initOptionsModule.loadFonts(typstFontUrls, loadRemoteFontsOptions),
                ],
                getModule: () =>
                  'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler@0.7.0-rc2/pkg/typst_ts_web_compiler_bg.wasm',
              });
              // 设置渲染器初始化选项
              $typst.setRendererInitOptions({
                getModule: () =>
                  'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer@0.7.0-rc2/pkg/typst_ts_renderer_bg.wasm',
              });
              // 初始渲染
              await previewSvg('%s', $typst);
            } catch (error) {
              console.error('Failed to initialize Typst:', error);
            }
          }
          // 启动渲染
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initTypstRendering);
          } else {
            initTypstRendering();
          }
        </script>
        """;

        return String.format(typstScript, typstFontUrl, typstSelector);
    }
}
