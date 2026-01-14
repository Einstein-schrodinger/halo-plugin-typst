// typst-typ-mapper.ts
import { $typst } from '@myriaddreamin/typst.ts';

// 支持的 Typst 文件扩展名
export const TYPST_EXTENSION = '.typ';

// 映射结果
export interface TypstMappingResult {
  originalPath: string;
  mappedPath: string;
  success: boolean;
  error?: string;
}

// 提取的 Typst 文件信息
interface ExtractedTypstFile {
  fullMatch: string;
  type: 'include' | 'import';
  path: string;
  startIndex: number;
  endIndex: number;
  hasHash: boolean;
  parameters: string;
}

// Typst 文件映射器类
export class TypstTypMapper {
  private compiler: any = null;
  private mappingCache = new Map<string, string>();

  // 初始化编译器
  async initCompiler(): Promise<void> {
    if (!this.compiler) {
      this.compiler = await $typst.getCompiler();
    }
  }

  // 检查是否是 Typst 文件路径
  isTypstFilePath(path: string): boolean {
    if (!path || typeof path !== 'string') return false;
    
    // 检查是否是 @preview/ 开头的包引用
    if (path.startsWith('@preview/')) {
      return true;
    }
    
    // 检查文件扩展名是否为 .typ
    const lowerPath = path.toLowerCase();
    return lowerPath.endsWith(TYPST_EXTENSION);
  }

  // 从 Typst 代码中提取 Typst 文件信息
  extractTypstFiles(typstCode: string): ExtractedTypstFile[] {
    const files: ExtractedTypstFile[] = [];
    
    // 匹配 include 语句
    const includeRegex = /(#?)include\s*"([^"]+)"\s*(?:,\s*([^,]+))?/g;
    
    // 改进的 import 正则表达式，支持多个导入项
    // 匹配格式: import "path": item1, item2 as alias2, item3
    const importRegex = /(#?)import\s*"([^"]+)"\s*:\s*([^,]+(?:\s*,\s*[^,]+)*)/g;
    
    let match;
    
    // 匹配 include 语句
    while ((match = includeRegex.exec(typstCode)) !== null) {
      const fullMatch = match[0];
      const hasHash = match[1] === '#';
      const path = match[2];
      const parameters = match[3] || '';
      
      if (this.isTypstFilePath(path)) {
        files.push({
          fullMatch,
          type: 'include',
          path,
          startIndex: match.index,
          endIndex: match.index + fullMatch.length,
          hasHash,
          parameters: parameters.trim()
        });
      }
    }
    
    // 匹配 import 语句
    while ((match = importRegex.exec(typstCode)) !== null) {
      const fullMatch = match[0];
      const hasHash = match[1] === '#';
      const path = match[2];
      const parameters = match[3] || '';
      
      if (this.isTypstFilePath(path)) {
        files.push({
          fullMatch,
          type: 'import',
          path,
          startIndex: match.index,
          endIndex: match.index + fullMatch.length,
          hasHash,
          parameters: parameters.trim()
        });
      }
    }
    
    return files;
  }

  // 获取 Typst 文件内容
  private async fetchTypstContent(url: string): Promise<Uint8Array> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch Typst file: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  // 生成映射后的路径（如 /bar.typ）
  private generateMappedPath(originalPath: string): string {
    try {
      // 如果是 @preview/ 包引用，保持原样
      if (originalPath.startsWith('@preview/')) {
        return originalPath;
      }
      
      // 如果是相对路径或绝对路径，直接使用文件名
      if (originalPath.startsWith('/') || !originalPath.includes('://')) {
        const filename = originalPath.split('/').pop() || 'file';
        const nameWithoutExt = filename.replace(/\.\w+$/, '');
        return `/${nameWithoutExt}${TYPST_EXTENSION}`;
      }
      
      // 如果是 URL，提取文件名
      const url = new URL(originalPath);
      const pathname = url.pathname;
      const filename = pathname.split('/').pop() || 'file';
      const nameWithoutExt = filename.replace(/\.\w+$/, '');
      return `/${nameWithoutExt}${TYPST_EXTENSION}`;
    } catch (error) {
      // 如果不是有效的 URL，直接使用文件名
      const filename = originalPath.split('/').pop() || 'file';
      const nameWithoutExt = filename.replace(/\.\w+$/, '');
      return `/${nameWithoutExt}${TYPST_EXTENSION}`;
    }
  }

  // 映射单个 Typst 文件
  async mapTypstFile(typstPath: string): Promise<TypstMappingResult> {
    try {
      // 检查缓存
      if (this.mappingCache.has(typstPath)) {
        const mappedPath = this.mappingCache.get(typstPath)!;
        return {
          originalPath: typstPath,
          mappedPath,
          success: true
        };
      }

      // 生成映射后的路径
      const mappedPath = this.generateMappedPath(typstPath);
      
      // 如果是 @preview/ 包引用，不需要获取内容
      if (typstPath.startsWith('@preview/')) {
        this.mappingCache.set(typstPath, mappedPath);
        return {
          originalPath: typstPath,
          mappedPath,
          success: true
        };
      }

      // 确保编译器已初始化
      await this.initCompiler();

      // 获取 Typst 文件内容
      const typstContent = await this.fetchTypstContent(typstPath);
      
      // 映射到编译器
      await this.compiler.mapShadow(mappedPath, typstContent);
      
      // 缓存映射结果
      this.mappingCache.set(typstPath, mappedPath);
      
      return {
        originalPath: typstPath,
        mappedPath,
        success: true
      };
    } catch (error) {
      return {
        originalPath: typstPath,
        mappedPath: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 处理 Typst 代码中的所有 Typst 文件
  async processTypstCode(typstCode: string): Promise<{
    processedCode: string;
    results: TypstMappingResult[];
  }> {
    const typstFiles = this.extractTypstFiles(typstCode);
    const results: TypstMappingResult[] = [];
    let processedCode = typstCode;
    
    // 需要从后往前处理，这样索引才不会因为替换而改变
    const sortedFiles = [...typstFiles].sort((a, b) => b.startIndex - a.startIndex);

    for (const file of sortedFiles) {
      const result = await this.mapTypstFile(file.path);
      results.push(result);
      
      if (result.success) {
        // 构建新的语句，保留所有参数和格式
        const hashPrefix = file.hasHash ? '#' : '';
        let newStatement: string;
        
        if (file.type === 'include') {
          const paramsPart = file.parameters ? `, ${file.parameters}` : '';
          newStatement = `${hashPrefix}include "${result.mappedPath}"${paramsPart}`;
        } else {
          newStatement = `${hashPrefix}import "${result.mappedPath}": ${file.parameters}`;
        }
        
        // 替换代码中的语句
        processedCode = 
          processedCode.substring(0, file.startIndex) + 
          newStatement + 
          processedCode.substring(file.endIndex);
      }
    }

    return {
      processedCode,
      results
    };
  }

  // 清空缓存
  clearCache(): void {
    this.mappingCache.clear();
    if (this.compiler) {
      this.compiler.resetShadow();
    }
  }

  // 移除单个文件的映射
  async unmapFile(originalPath: string): Promise<void> {
    if (this.mappingCache.has(originalPath)) {
      const mappedPath = this.mappingCache.get(originalPath)!;
      await this.compiler.unmapShadow(mappedPath);
      this.mappingCache.delete(originalPath);
    }
  }

  // 获取所有已映射的文件
  getMappedFiles(): Array<{originalPath: string, mappedPath: string}> {
    return Array.from(this.mappingCache.entries()).map(([originalPath, mappedPath]) => ({
      originalPath,
      mappedPath
    }));
  }

  // 检查文件是否已映射
  isFileMapped(originalPath: string): boolean {
    return this.mappingCache.has(originalPath);
  }
}

// 创建默认实例
export const defaultTypstMapper = new TypstTypMapper();

// 工具函数：处理 Typst 代码中的 Typst 文件
export async function processTypstFiles(typstCode: string): Promise<string> {
  const result = await defaultTypstMapper.processTypstCode(typstCode);
  return result.processedCode;
}
