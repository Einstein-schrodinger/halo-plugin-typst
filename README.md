# halo-plugin-typst
Typst 插件，实现 Typst 代码在 **默认编辑器** 与文章页的渲染，[Typst](https://typst.app/) 是一种新的基于标记的排版系统，旨在提供与 LaTeX 相似的强大功能，但更易于学习和使用，可以像 Markdown 一样快速上手。

## 效果预览
![](https://www.sqwfly.top/upload/typst_plugin_20260109195534.avif)

全屏编辑模式：
![](https://www.sqwfly.top/upload/typst_plugin_20260109195556.avif)

## 下载方式
1. Halo 应用市场
2. GitHub Releases：访问 [Releases](https://github.com/Einstein-schrodinger/halo-plugin-typst/releases) 下载 Assets 中的 JAR 文件

## 使用方式
1. 在默认编辑器中的菜单栏中点击 **+** 插入 **Typst 编辑块**
   ![](https://www.sqwfly.top/upload/typst_plugin_20260109200224.avif)

2. 在默认编辑器中输入指令 `\typst` 可以快速插入 Typst 编辑块

## 使用建议
1. 你可以浏览 [Typst 官方文档](https://typst.app/docs/) 来学习 Typst 代码的语法和使用方法，如果你对 Typst 代码的语法不是很熟悉，或者想快速实现某个 Typst 效果，不妨在 AI 的帮助下快速生成 Typst 代码 实现想要的效果
2. 你可以在 [Typst Universe](https://typst.app/universe/search/?kind=packages) 中搜索 Typst Package 来获取更多的 Typst 代码示例和 Package 信息，我相信这里面一定有能够吸引你的内容
3. 该插件更适合渲染片段代码来生成博客文章的插图，而不是作为 Typst 编辑器来使用，该插件渲染得到的为具有高质量和小体积的SVG图像
4. Typst 编辑块 默认支持渲染英文和emoji表情，如果你需要渲染中日韩文字，你需要在配置项中配置字体，**使用完整的url地址并且不得跨域，不支持woff以及woff2字体**
   ![](https://www.sqwfly.top/upload/typst_plugin_20260109200555.avif)

## 注意事项
1. Typst 编辑块 不支持以相对路径引入文件
2. 本插件依赖的核心库 [typst.ts](https://github.com/Myriad-Dreamin/typst.ts) 目前支持的 Typst 版本为 0.14.2，所以在使用时如果你导入的 Typst Package 所依赖的 Typst 版本高于 0.14.2 会导致渲染错误，在确定没有语法问题的情况下渲染失败，大概率是 Package 版本的问题
3. 本插件在渲染 Typst 代码时，会将 Typst 代码转换为 SVG 图片，所以在渲染时会有一定的延迟，并占用的一定的资源，请不要渲染过于复杂或大量的 Typst 代码，否则会导致页面卡顿甚至卡死
4. 在禁用或卸载该插件之后，所有 Typst 编辑块都会隐藏，**在不修改原文章任何内容的情况下**，重新启用可以恢复，否则会直接消失
5. 删除时双击标题栏选中 Typst 编辑块，然后删除，或者点击左侧的菜单按钮进行删除

## 贡献指南
>亟待解决的问题：
>
>当前卸载或禁用之后内容会直接消失并且无法导出，期望在插件卸载或禁用之后可以保留 Typst 代码；更进一步插件失效后如果代码内容可以 Typst 代码块的形式呈现而非普通文本则更加直观，同时在导出为 Markdown 格式时也更友好

欢迎提交 Issue 和 Pull Request 来帮助改进项目，希望更多贡献者可以参与进来使该插件从能用到好用

所需环境：
1. Java 21+
2. Node 20+
3. pnpm 10+
4. Docker (可选)

克隆项目进行开发，开发流程参考[插件开发指南](https://docs.halo.run/category/%E6%8F%92%E4%BB%B6%E5%BC%80%E5%8F%91)

```bash
git clone git@github.com:Einstein-schrodinger/halo-plugin-typst.git

# 或者当你 fork 之后
git clone git@github.com:{your_github_id}/halo-plugin-typst.git
```

## 画饼
1. 支持相对路径导入文件 
2. 支持PDF导出
3. Typst 编辑块 的代码编辑区支持 Typst 代码高亮

## 致谢
- [Myriad-Dreamin/typst.ts](https://github.com/Myriad-Dreamin/typst.ts)：本插件依赖的核心库，感谢该项目的贡献者们
- [plugin-katex](https://github.com/halo-sigs/plugin-katex)，[plugin-text-diagram](https://github.com/halo-sigs/plugin-text-diagram)：本插件大部分代码基于这两个插件的代码实现，感谢这两个插件的贡献者们
- [Trae CN](https://www.trae.cn/)：本插件的大部分代码由 Trae CN 完成，特别感谢 Trae CN 对本项目的贡献，让我略懂一点语法也可以“指挥”AI在以上两个插件的基础上实现 Typst 编辑块的功能

## 许可证
本项目基于 GPL-3.0 许可证开源 - 查看 [LICENSE](https://github.com/Einstein-schrodinger/halo-plugin-typst/blob/main/LICENSE) 文件了解详情