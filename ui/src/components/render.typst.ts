import { $typst } from '@myriaddreamin/typst.ts'
import { processTypstResources, type ResourceMappingResult } from './typst-resource-mapper.ts'

const generateNamespaceId = (): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 9)
  return `typst_${timestamp}_${random}`
}

/**
 * 为 SVG 中的 JavaScript 代码添加命名空间。
 * 解决当多个 SVG 同时渲染时，JavaScript 代码变量名冲突的问题。
 *
 * @param svg 原始 SVG 代码
 * @param namespaceId 命名空间 ID
 * @returns 经过 IIFE 处理后的 SVG 代码
 */
const addNamespaceToSvgScript = (svg: string, namespaceId: string): string => {
  return svg.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (_match, scriptContent) => {
    const wrappedScript = `
      (function(window_${namespaceId}) {
        const originalWindow = window;
        ${scriptContent}
      }.call(this, window));
    `.trim()
    return `<script>${wrappedScript}</script>`
  })
}

// 渲染函数
export const renderTypst = async (
        content: string,
        onRenderingStart?: () => void,
        onRenderingComplete?: () => void
): Promise<string> => {
  // 检查内容
  if (!content?.trim()) {
    return '<p style="color: #999; font-style: italic;">请输入 Typst 代码</p>'
  }
  try {
    // 通知开始渲染
    onRenderingStart?.()
    // 处理资源映射（图片和数据文件）
    const resourceResult: ResourceMappingResult = await processTypstResources(content)
    // 渲染 SVG
    const svg = await $typst.svg({
      mainContent: resourceResult.processedCode,
    })
    const namespaceId = generateNamespaceId()
    return addNamespaceToSvgScript(svg, namespaceId)
  } catch (err) {
    return `
      <div class="typst-render-error">
        <h4>Typst 渲染错误</h4>
        <p>${err instanceof Error ? err.message : '未知错误'}</p>
        <p>请检查代码语法和资源链接是否正确!</p>
      </div>
    `
  } finally {
    // 通知渲染完成（无论成功或失败）
    onRenderingComplete?.()
  }
}
