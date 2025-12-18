# halo-plugin-typst
Typst 插件，这是一个运行在 Halo 建站系统上的插件项目，实现 Typst 代码的在 **默认编辑器** 与文章页的渲染，[Typst](https://typst.app) 是一种新的基于标记的排版系统，旨在提供与 LaTeX 相似的强大功能，但更易于学习和使用。

## 下载方式
1. Halo 应用市场：<https://halo.run/store/apps>
2. GitHub Releases：访问 [Releases](https://github.com/halo-sigs/halo-plugin-typst/releases) 下载 Assets 中的 JAR 文件。

## 使用方式
1. 在默认编辑器中的菜单栏中点击 **+** 插入 **Typst 编辑块**
2. 在默认编辑器中输入指令 `\typst` 可以快速插入 Typst 编辑块

## 使用建议
1. 你可以浏览 [Typst 官方文档](https://typst.app/docs/) 来学习 Typst 代码的语法和使用方法，如果你对 Typst 代码的语法不是很熟悉，或者想快速实现某个 Typst 效果，不妨在 AI 的帮助下快速生成 Typst 代码 实现想要的效果
2. 你可以在 [Typst Universe](https://typst.app/universe/search/?kind=packages) 中搜索 Typst Package 来获取更多的 Typst 代码示例和 Package 信息，我相信这里面一定有能够吸引你的内容
3. 该插件更适合解析短代码来生成博客文章的插图，而不是作为 Typst 编辑器来使用，该插件渲染的得到SVG图像可以同时实现高质量和小体积的特点，同时也支持 3D 图像渲染等复杂效果

## 注意事项
1. Typst 编辑块 支持渲染中文、英文、日文以及emoji表情
2. Typst 编辑块 不支持导入本地文件
3. 本插件依赖的核心库 [typst.ts](https://github.com/Myriad-Dreamin/typst.ts) 目前支持的 Typst 版本为 0.14.0，所以在使用时如果你导入的 Typst Package 所依赖的 Typst 版本高于 0.14.0 会导致渲染错误，在确定没有语法问题的情况下渲染失败，大概率是 Package 版本的问题。
4. 本插件在渲染 Typst 代码时，会将 Typst 代码转换为 SVG 图片，所以在渲染时会有一定的延迟，并占用的一定的资源，请不要渲染过于复杂或大量的 Typst 代码，否则会导致页面卡顿甚至卡死，比如一些包含 3D 图像渲染的 Typst 代码。
5. 在禁用或卸载该插件之后，所有 Typst 编辑块都会隐藏，**在不修改原文章任何内容的情况下**，重新启用可以恢复，否则会直接消失。
6. 删除时双击标题栏选中 Typst 编辑块，然后删除，或者点击左侧的菜单按钮进行删除。

## 贡献指南
欢迎提交 Issue 和 Pull Request 来帮助改进项目！

Halo 插件开发的详细文档请查阅：<https://docs.halo.run/developer-guide/plugin/introduction>

所需环境：
1. Java 21
2. Node 20
3. pnpm 9
4. Docker (可选)

克隆项目：
```bash
git clone git@github.com:Einstein-schrodinger/halo-plugin-typst.git

# 或者当你 fork 之后
git clone git@github.com:{your_github_id}/halo-plugin-typst.git
```

## 后续计划
1. 支持中文✅️
2. 支持本地导入 **.typ文件** 
3. 支持PDF导出
4. Typst 编辑块 的代码编辑区支持Typst代码高亮

## 致谢
- [Myriad-Dreamin/typst.ts](https://github.com/Myriad-Dreamin/typst.ts) 本插件依赖的核心库，感谢该项目的贡献者们
- [plugin-katex](https://github.com/halo-sigs/plugin-katex)，[plugin-text-diagram](https://github.com/halo-sigs/plugin-text-diagram) 本插件基于这两个插件的代码实现，让我略懂一点语法的小白可以在这两个插件的基础上实现了 Typst 编辑块的功能，感谢这两个插件的贡献者们，由此可见优秀的社区会催生更多乐于贡献的开发者
- [Trae CN](https://www.trae.cn/) 本插件的大部分代码由 Trae CN 协助完成，特别感谢 Trae CN 对本项目的贡献

## 许可证
本项目基于 GPL-3.0 许可证开源 - 查看 [LICENSE](https://github.com/Einstein-schrodinger/halo-plugin-typst/blob/main/LICENSE) 文件了解详情

