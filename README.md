# halo-plugin-typst

Typst 插件，实现 Typst 代码在 **默认编辑器** 与文章页的渲染，[Typst](https://typst.app/) 是一种新的基于标记的排版系统，旨在提供与 LaTeX 相似的强大功能，但更易于学习和使用，可以像 Markdown 一样快速上手。

Typst 插件（更准确的说是Typst）可以用来渲染各式各样的排版内容，通过选择合适的 Template 可以轻松渲染精美的学术笔记、简历、海报等，此外，该插件也适合渲染片段代码来作为博客文章的插图，借助各种 Package 可以实现任何你想要的效果，比如借助 CeTZ 等 Package 可以轻松绘制各种图像，例如流程图、电路图、五线谱图、二维函数图、三维函数图等。

## 效果预览

### 笔记渲染

>示例来自：
>
>[**EasePaper**](https://github.com/Dawnfz-Lenfeng/easy-paper)

![](https://www.sqwfly.top/upload/plugin_typst_20260114175509.avif)

### 片段代码渲染

>示例来自：
>
>1.[**cetz-plot**](https://typst.app/universe/package/cetz-plot)
>
>2.[**physica**](https://typst.app/universe/package/physica)

![](https://www.sqwfly.top/upload/plugin_typst_20260109195534.avif)

全屏编辑模式：
![](https://www.sqwfly.top/upload/plugin_typst_20260109195556.avif)

## 下载方式

1. Halo 应用市场 [Typst](https://www.halo.run/store/apps/app-rro9gtqh)
2. GitHub Releases：访问 [Releases](https://github.com/Einstein-schrodinger/halo-plugin-typst/releases) 下载 Assets 中的 JAR 文件

## 使用方式

1. 在默认编辑器的菜单栏中点击 **+** 插入 **Typst 编辑块**
   ![](https://www.sqwfly.top/upload/plugin_typst_20260109200224.avif)

2. 在默认编辑器中点击左侧的菜单按钮 **+** 插入 **Typst 编辑块**

   ![](https://www.sqwfly.top/upload/plugin_typst_20260114180858.avif)

## 使用建议与指南

1. 你可以浏览 [Typst 官方文档](https://typst.app/docs/) 来学习 Typst 语法和使用方法，如果你对 Typst 语法不是很熟悉，或者想快速实现特定的排版，可以浏览官网提供的海量模板 [Typst Templates](https://typst.app/universe/search/?kind=templates)，这里的 Template 与 Halo 应用市场中的主题类似

2. 你还可以浏览官网提供的 [Typst Packages](https://typst.app/universe/search/?kind=packages) 来给内容提供不同的展示形式，这里的 Package 与 Halo 应用市场中的插件类似

3. Typst 编辑块 默认支持渲染英文和emoji表情，如果你需要渲染中日韩文字，你需要在配置项中配置字体，**使用完整的url地址并且不得跨域，不支持woff以及woff2字体**
   ![](https://www.sqwfly.top/upload/plugin_typst_20260109200555.avif)

4. 任何资源的导入需要**使用完整的url地址并且不得跨域**，下面提供一些示例供使用者参考，域名需要替换为你自己的站点域名，其余路径根据资源位置进行调整

   ```typst
   // typ文件导入
   #import "https://www.sqwfly.top/upload/conf.typ": conf
     
   // 图片渲染
   #figure(
    image("https://www.sqwfly.top/upload/molecular.jpg", width: 80%),
     caption: [
    A step in the molecular testing
    pipeline of our lab.
     ],
   )
   
   // 参考文献 Hayagriva .yaml/.yml 格式 
   #bibliography("https://www.sqwfly.top/upload/Hayagriva.yaml")
   
   // 参考文献  BibLaTeX 格式
   #bibliography("https://www.sqwfly.top/upload/works.bib")
   ```

5. 删除时双击标题栏选中 Typst 编辑块，然后删除，或者点击左侧的菜单按钮进行删除

   ![](https://www.sqwfly.top/upload/plugin_typst_20260114181008.avif)

## 注意事项

1. 本插件会编译并渲染 Typst 代码为 SVG 图片，所以整个过程需要一定的时间，并占用一定的资源，请不要在“简陋”的服务器上书写过于复杂或大量的 Typst 代码，否则会导致页面卡顿甚至卡死，**初次渲染时请耐心等待，可能需要1~3分钟（也与加载的自定义字体文件大小有关）**，好在经过 **[LIlGG](https://github.com/Einstein-schrodinger/halo-plugin-typst/pull/1)** 的优化，现在只需要编辑器渲染完毕，主题端会直接加载其渲染结果，无需二次编译与渲染，对于访客来言是无感的
2. 本插件依赖的核心库 [typst.ts](https://github.com/Myriad-Dreamin/typst.ts) 目前支持的 Typst 版本为 0.14.2，在使用时如果你导入的 Package 所依赖的 Typst 版本高于 0.14.2 会导致渲染失败，在确定没有语法和资源导入问题的情况下渲染失败，大概率是 Package 版本的问题

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目，希望更多贡献者可以参与进来使该插件从能用到好用

所需环境：

1. Java 21+

2. Node 20+

3. pnpm 10+

4. Docker (可选)

克隆项目进行开发，开发流程参考：[插件开发指南](https://docs.halo.run/category/%E6%8F%92%E4%BB%B6%E5%BC%80%E5%8F%91)

```bash
git clone git@github.com:Einstein-schrodinger/halo-plugin-typst.git

# 或者当你 fork 之后
git clone git@github.com:{your_github_id}/halo-plugin-typst.git
```

## 画饼

1. 支持PDF导出
2. Typst 编辑块 的代码编辑区支持 Typst 代码高亮

## 致谢

- [Myriad-Dreamin/typst.ts](https://github.com/Myriad-Dreamin/typst.ts)：本插件依赖的核心库，感谢该项目的贡献者们
- [plugin-katex](https://github.com/halo-sigs/plugin-katex)，[plugin-text-diagram](https://github.com/halo-sigs/plugin-text-diagram)：本插件部分代码基于这两个插件的代码实现，感谢这两个插件的贡献者们
- [Trae CN](https://www.trae.cn/)：本插件的大部分代码由 Trae CN 完成，特别感谢 Trae CN 对本项目的贡献，让我略懂一点语法也可以“指挥”AI在以上两个插件的基础上实现 Typst 编辑块的功能
- [LIlGG](https://github.com/Einstein-schrodinger/halo-plugin-typst/pull/1)：感谢该贡献者对本插件的大幅度优化🌹

## 许可证

本项目基于 GPL-3.0 许可证开源 - 查看 [LICENSE](https://github.com/Einstein-schrodinger/halo-plugin-typst/blob/main/LICENSE) 文件了解详情