// typst-image-mapper.js
// 支持的图片格式
export const SUPPORTED_IMAGE_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.tiff'
];

// 图片映射器类
export class TypstImageMapper {
  constructor() {
    this.compiler = null;
    this.mappingCache = new Map();
  }

  // 初始化编译器
  async initCompiler() {
    if (!this.compiler) {
      this.compiler = await $typst.getCompiler();
    }
  }

  // 检查是否是图片路径
  isImagePath(path) {
    if (!path || typeof path !== 'string') return false;
    
    const lowerPath = path.toLowerCase();
    return SUPPORTED_IMAGE_EXTENSIONS.some(ext => lowerPath.endsWith(ext));
  }

  // 从 Typst 代码中提取图片信息
  extractImages(typstCode) {
    const images = [];
    
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
  async fetchImageData(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  // 映射单个图片
  async mapImage(imagePath) {
    try {
      // 检查缓存
      if (this.mappingCache.has(imagePath)) {
        const mappedPath = this.mappingCache.get(imagePath);
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
      console.error('Failed to map image:', error);
      return {
        originalPath: imagePath,
        mappedPath: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 获取文件扩展名
  getFileExtension(path) {
    const match = path.match(/\.([a-z0-9]+)(?:[?#]|$)/i);
    return match ? `.${match[1].toLowerCase()}` : '';
  }

  // 处理 Typst 代码中的所有图片
  async processTypstCode(typstCode) {
    const images = this.extractImages(typstCode);
    const results = [];
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
  clearCache() {
    this.mappingCache.clear();
  }
}

// 创建默认实例
export const defaultImageMapper = new TypstImageMapper();

// 工具函数：处理 Typst 代码
export async function processTypstImages(typstCode) {
  const result = await defaultImageMapper.processTypstCode(typstCode);
  return result.processedCode;
}
