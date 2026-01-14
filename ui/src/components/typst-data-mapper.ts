// typst-data-mapper.ts
import { $typst } from '@myriaddreamin/typst.ts';

// 支持的数据文件格式
export const SUPPORTED_DATA_EXTENSIONS = [
  '.csv', '.json', '.toml', '.xml', '.yaml', '.yml', '.bib', '.bibtex'
];

// 支持的 Typst 数据函数
export const SUPPORTED_DATA_FUNCTIONS = [
  'csv', 'json', 'toml', 'xml', 'yaml', 'bibliography'
];

// 映射结果
export interface DataMappingResult {
  originalPath: string;
  mappedPath: string;
  success: boolean;
  error?: string;
}

// 提取的数据文件信息
interface ExtractedDataFile {
  fullMatch: string;
  functionName: string;
  path: string;
  startIndex: number;
  endIndex: number;
  hasHash: boolean;
  parameters: string;
}

// 数据文件映射器类
export class TypstDataMapper {
  private compiler: any = null;
  private mappingCache = new Map<string, string>();

  // 初始化编译器
  async initCompiler(): Promise<void> {
    if (!this.compiler) {
      this.compiler = await $typst.getCompiler();
    }
  }

  // 检查是否是数据文件路径
  isDataFilePath(path: string): boolean {
    if (!path || typeof path !== 'string') return false;
    
    const lowerPath = path.toLowerCase();
    return SUPPORTED_DATA_EXTENSIONS.some(ext => lowerPath.endsWith(ext));
  }

  // 从 Typst 代码中提取数据文件信息
  extractDataFiles(typstCode: string): ExtractedDataFile[] {
    const files: ExtractedDataFile[] = [];
    
    // 构建正则表达式，匹配所有支持的数据函数
    const functionNames = SUPPORTED_DATA_FUNCTIONS.join('|');
    const dataFunctionRegex = new RegExp(
      `(#?)(${functionNames})\\s*\\(\\s*"([^"]+)"\\s*(?:,\\s*([^)]*))?\\)`,
      'g'
    );
    
    let match;
    while ((match = dataFunctionRegex.exec(typstCode)) !== null) {
      const fullMatch = match[0];
      const hasHash = match[1] === '#';
      const functionName = match[2];
      const path = match[3];
      const parameters = match[4] || '';
      
      if (this.isDataFilePath(path)) {
        files.push({
          fullMatch,
          functionName,
          path,
          startIndex: match.index,
          endIndex: match.index + fullMatch.length,
          hasHash,
          parameters
        });
      }
    }
    
    return files;
  }

  // 获取数据文件内容
  private async fetchDataContent(url: string): Promise<Uint8Array> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data file: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  // 生成映射后的路径（如 /we.csv）
  private generateMappedPath(originalPath: string): string {
    // 提取文件名
    const url = new URL(originalPath);
    const pathname = url.pathname;
    const filename = pathname.split('/').pop() || 'data';
    
    // 确保路径以 / 开头
    return filename.startsWith('/') ? filename : `/${filename}`;
  }

  // 映射单个数据文件
  async mapDataFile(dataPath: string): Promise<DataMappingResult> {
    try {
      // 检查缓存
      if (this.mappingCache.has(dataPath)) {
        const mappedPath = this.mappingCache.get(dataPath)!;
        return {
          originalPath: dataPath,
          mappedPath,
          success: true
        };
      }

      // 确保编译器已初始化
      await this.initCompiler();

      // 获取数据文件内容
      const dataContent = await this.fetchDataContent(dataPath);
      
      // 生成映射后的路径
      const mappedPath = this.generateMappedPath(dataPath);
      
      // 映射到编译器
      await this.compiler.mapShadow(mappedPath, dataContent);
      
      // 缓存映射结果
      this.mappingCache.set(dataPath, mappedPath);
      
      return {
        originalPath: dataPath,
        mappedPath,
        success: true
      };
    } catch (error) {
      return {
        originalPath: dataPath,
        mappedPath: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 处理 Typst 代码中的所有数据文件
  async processTypstCode(typstCode: string): Promise<{
    processedCode: string;
    results: DataMappingResult[];
  }> {
    const dataFiles = this.extractDataFiles(typstCode);
    const results: DataMappingResult[] = [];
    let processedCode = typstCode;
    
    // 需要从后往前处理，这样索引才不会因为替换而改变
    const sortedFiles = [...dataFiles].sort((a, b) => b.startIndex - a.startIndex);

    for (const file of sortedFiles) {
      const result = await this.mapDataFile(file.path);
      results.push(result);
      
      if (result.success) {
        // 构建新的函数调用，保留所有参数
        const hashPrefix = file.hasHash ? '#' : '';
        const paramsPart = file.parameters ? `, ${file.parameters}` : '';
        const newFunctionCall = `${hashPrefix}${file.functionName}("${result.mappedPath}"${paramsPart})`;
        
        // 替换代码中的函数调用
        processedCode = 
          processedCode.substring(0, file.startIndex) + 
          newFunctionCall + 
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
}

// 创建默认实例
export const defaultDataMapper = new TypstDataMapper();

// 工具函数：处理 Typst 代码中的数据文件
export async function processTypstDataFiles(typstCode: string): Promise<string> {
  const result = await defaultDataMapper.processTypstCode(typstCode);
  return result.processedCode;
}
