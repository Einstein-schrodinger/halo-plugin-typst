import { rsbuildConfig } from '@halo-dev/ui-plugin-bundler-kit';
import Icons from "unplugin-icons/rspack";
import { pluginSass } from "@rsbuild/plugin-sass";
import type { RsbuildConfig } from "@rsbuild/core";

export default rsbuildConfig({
  rsbuild: {
    resolve: {
      alias: {
        "@": "./src",
        "@components": "./src/components",
        "@assets": "./src/assets",
      },
    },
    plugins: [pluginSass()],
    tools: {
      rspack: {
        plugins: [Icons({ compiler: "vue3" })],
        module: {
          rules: [
            {
              test: /\.wasm$/,
              type: "asset/resource",
            },
            {
              test: /\.(woff|woff2|eot|ttf|otf)$/,
              type: "asset/resource",
              generator: {
                filename: "assets/fonts/[name][ext]",
              },
            },
          ],
        },
        experiments: {
          asyncWebAssembly: true,
        },
        optimization: {
          minimize: false,
        },
        output: {
          module: true,
        },
      },
    },
  },
}) as RsbuildConfig
