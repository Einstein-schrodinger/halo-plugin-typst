import { rsbuildConfig } from '@halo-dev/ui-plugin-bundler-kit'
import Icons from 'unplugin-icons/rspack'
import { pluginSass } from '@rsbuild/plugin-sass'
import type { RsbuildPlugin } from '@rsbuild/core'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import path, { join, dirname } from 'path'

const OUT_DIR_PROD = "../src/main/resources/console";
const OUT_DIR_DEV = "../build/resources/main/console";

const pluginCopyStyles = (staticDir: string): RsbuildPlugin => ({
  name: 'plugin-copy-styles',
  setup(api) {
    api.onAfterBuild(async ({ environments }) => {
      const distPath = Object.values(environments)[0]?.distPath

      if (!distPath) return;

      const styleCssPath = join(distPath, 'style.css')
      const targetPath = join(process.cwd(), staticDir, 'typst.css')

      if (existsSync(styleCssPath)) {
        const targetDir = dirname(targetPath)
        if (!existsSync(targetDir)) {
          mkdirSync(targetDir, { recursive: true })
        }
        copyFileSync(styleCssPath, targetPath)
      }
    })
  },
})

export default rsbuildConfig({
  rsbuild: ({ envMode }) => {
    const isProduction = envMode === "production";
    const outDir = isProduction ? OUT_DIR_PROD : OUT_DIR_DEV;
    const staticDir = path.join(outDir, "../static");

    return {
      output: {
        distPath: {
          root: outDir,
        },
      },
      resolve: {
        alias: {
          '@': './src',
        },
      },
      plugins: [pluginSass(), pluginCopyStyles(staticDir)],
      tools: {
        rspack: {
          plugins: [Icons({ compiler: 'vue3' })],
          module: {
            rules: [
              {
                test: /\.wasm$/,
                type: 'asset/resource',
              },
            ],
          },
          experiments: {
            asyncWebAssembly: true,
          },
          optimization: {
            minimize: isProduction,
          },
          output: {
            module: true,
          },
        },
      },
    }
  },
})
