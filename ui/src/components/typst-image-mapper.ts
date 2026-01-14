// typst-image-mapper.ts
import { $typst } from '@myriaddreamin/typst.ts';

// 支持的图片格式
export const SUPPORTED_IMAGE_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.tiff'
];

// 映射结果
export interface MappingResult {
  originalPath: string;
  mappedPath: string;
  success: boolean;
  error?: string;
}

// 提取的图片信息
interface ExtractedImage {
  fullMatch: string;
  path: string;
  startIndex: number;
  endIndex: number;
  hasHash: boolean; // 是否有 # 前缀
  parameters: string; // 参数部分（如果有）
}

// 图片映射器类
export class TypstImageMapper {
  private compiler: any = null;
  private mappingCache = new Map<string, string>();

  // 初始化编译器
  async initCompiler(): Promise<void> {
    if (!this.compiler) {
      this.compiler = await $typst.getCompiler();
    }
  }

  // 检查是否是图片路径
  isImagePath(path: string): boolean {
    if (!path || typeof path !== 'string') return false;
    
    const lowerPath = path.toLowerCase();
    return SUPPORTED_IMAGE_EXTENSIONS.some(ext => lowerPath.endsWith(ext));
  }

  // 从 Typst 代码中提取图片信息
  extractImages(typstCode: string): ExtractedImage[] {
    const images: ExtractedImage[] = [];
    
    // 改进的正则表达式，精确匹配 image() 函数
    // 匹配 #image("path") 或 image("path")
    // 匹配 #image("path", width: 100%) 或 image("path", width: 100%)
    const imageRegex = /(#?)image\s*\(\s*"([^"]+)"\s*(?:,\s*([^)]*))?\)/g;
    
    let match;
    while ((match = imageRegex.exec(typstCode)) !== null) {
      const fullMatch = match[0];
      const hasHash = match[1] === '#';
      const path = match[2];
      const parameters = match[3] || '';
      
      if (this.isImagePath(path)) {
        images.push({
          fullMatch,
          path,
          startIndex: match.index,
          endIndex: match.index + fullMatch.length,
          hasHash,
          parameters
        });
      }
    }
    
    return images;
  }

  // 获取图片数据
  private async fetchImageData(url: string): Promise<Uint8Array> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  // 映射单个图片
  async mapImage(imagePath: string): Promise<MappingResult> {
    try {
      // 检查缓存
      if (this.mappingCache.has(imagePath)) {
        const mappedPath = this.mappingCache.get(imagePath)!;
        return {
          originalPath: imagePath,
          mappedPath,
          success: true
        };
      }

      // 确保编译器已初始化
      await this.initCompiler();

      // 获取图片数据
      const imageData = await this.fetchImageData(imagePath);
      
      // 生成唯一文件名
      const filename = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${this.getFileExtension(imagePath)}`;
      const mappedPath = `/${filename}`;
      
      // 映射到编译器
      await this.compiler.mapShadow(mappedPath, imageData);
      
      // 缓存映射结果
      this.mappingCache.set(imagePath, mappedPath);
      
      return {
        originalPath: imagePath,
        mappedPath,
        success: true
      };
    } catch (error) {
      return {
        originalPath: imagePath,
        mappedPath: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 获取文件扩展名
  private getFileExtension(path: string): string {
    const match = path.match(/\.([a-z0-9]+)(?:[?#]|$)/i);
    return match ? `.${match[1].toLowerCase()}` : '';
  }

  // 处理 Typst 代码中的所有图片
  async processTypstCode(typstCode: string): Promise<{
    processedCode: string;
    results: MappingResult[];
  }> {
    const images = this.extractImages(typstCode);
    const results: MappingResult[] = [];
    let processedCode = typstCode;
    
    // 需要从后往前处理，这样索引才不会因为替换而改变
    const sortedImages = [...images].sort((a, b) => b.startIndex - a.startIndex);

    for (const image of sortedImages) {
      const result = await this.mapImage(image.path);
      results.push(result);
      
      if (result.success) {
        // 构建新的 image 调用，保留所有参数
        const hashPrefix = image.hasHash ? '#' : '';
        const paramsPart = image.parameters ? `, ${image.parameters}` : '';
        const newImageCall = `${hashPrefix}image("${result.mappedPath}"${paramsPart})`;
        
        // 替换代码中的图片调用
        processedCode = 
          processedCode.substring(0, image.startIndex) + 
          newImageCall + 
          processedCode.substring(image.endIndex);
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
  }
}

// 创建默认实例
export const defaultImageMapper = new TypstImageMapper();

// 工具函数：处理 Typst 代码
export async function processTypstImages(typstCode: string): Promise<string> {
  const result = await defaultImageMapper.processTypstCode(typstCode);
  return result.processedCode;
}
