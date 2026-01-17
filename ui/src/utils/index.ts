import { consoleApiClient } from '@halo-dev/api-client'

const pluginName = 'plugin-typst';

// 获取插件配置中的 typstFontUrl
export const getTypstFontUrl = async (): Promise<string> => {
  try {
    const response = await consoleApiClient.plugin.plugin.fetchPluginJsonConfig({ name: pluginName });
    // 从返回的配置中获取 typstFontUrl
    // response.data 是一个对象，包含所有配置项分组
    // 实际数据结构: { "basic": { "typstFontUrl": "...", ... } }
    const data = response.data as { basic?: { typstFontUrl?: string } };
    return data?.basic?.typstFontUrl || '';
  } catch (error) {
    console.error('获取 typstFontUrl 失败:', error);
    return '';
  }
}
