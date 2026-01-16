import { $typst } from '@myriaddreamin/typst.ts'
import { processTypstResources, type ResourceMappingResult } from './typst-resource-mapper.ts'

// 渲染函数
export const renderTypst = async (content: string): Promise<string> => {
  // 检查内容
  if (!content?.trim()) {
    return '<p style="color: #999; font-style: italic;">请输入 Typst 代码</p>'
  }

  try {
    // 处理资源映射（图片和数据文件）
    const resourceResult: ResourceMappingResult = await processTypstResources(content)

    // 渲染 SVG
    const svg = await $typst.svg({
      mainContent: resourceResult.processedCode,
    })

    return svg
  } catch (err) {
    return `
      <div class="typst-render-error">
        <h4>Typst 渲染错误</h4>
        <p>${err instanceof Error ? err.message : '未知错误'}</p>
        <p>请检查代码语法和资源链接是否正确。</p>
      </div>
    `
  }
}
