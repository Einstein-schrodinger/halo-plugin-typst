// typst-resource-mapper.js
import { TypstImageMapper } from './typst-image-mapper.js';
import { TypstDataMapper } from './typst-data-mapper.js';
import { TypstTypMapper } from './typst-typ-mapper.js';

// 综合资源映射器
export class TypstResourceMapper {
  constructor() {
    this.imageMapper = new TypstImageMapper();
    this.dataMapper = new TypstDataMapper();
    this.typstMapper = new TypstTypMapper();
  }

  // 处理所有资源（Typst文件、图片和数据文件）
  async processTypstCode(typstCode) {
    // 先处理 Typst 文件（include/import）
    const typstResult = await this.typstMapper.processTypstCode(typstCode);
    
    // 再处理数据文件（在已处理的 Typst 文件代码基础上）
    const dataResult = await this.dataMapper.processTypstCode(typstResult.processedCode);
    
    // 最后处理图片（在已处理的数据文件代码基础上）
    const imageResult = await this.imageMapper.processTypstCode(dataResult.processedCode);
    
    return {
      processedCode: imageResult.processedCode,
      imageResults: imageResult.results,
      dataResults: dataResult.results,
      typstResults: typstResult.results
    };
  }

  // 清空所有缓存
  clearAllCache() {
    this.imageMapper.clearCache();
    this.dataMapper.clearCache();
    this.typstMapper.clearCache();
  }
}

// 创建默认实例
export const defaultResourceMapper = new TypstResourceMapper();

// 工具函数：处理 Typst 代码中的所有资源
export async function processTypstResources(typstCode) {
  const result = await defaultResourceMapper.processTypstCode(typstCode);
  return result;
}
