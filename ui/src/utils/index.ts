import { consoleApiClient } from '@halo-dev/api-client'

const pluginName = 'plugin-typst';

// 定义插件配置的类型
interface PluginConfig {
  basic?: {
    typstFontUrl?: string;
    typstSelector?: string;
  };
}

// 获取插件完整配置
export const getPluginConfig = async (): Promise<PluginConfig> => {
  try {
    const response = await consoleApiClient.plugin.plugin.fetchPluginJsonConfig({ name: pluginName });
    return (response.data as PluginConfig) || {};
  } catch (error) {
    console.error('获取插件配置失败:', error);
    return {};
  }
};

// 获取插件配置中的 typstFontUrl
export const getTypstFontUrl = async (): Promise<string> => {
  try {
    // 方法需要传入一个包含 name 属性的对象作为参数
    const response = await consoleApiClient.plugin.plugin.fetchPluginJsonConfig({ name: pluginName });
    // 从返回的配置中获取 typstFontUrl
    // response.data 是一个对象，包含所有配置项分组
    // 实际数据结构: { "basic": { "typstFontUrl": "...", ... } }
    const data = response.data as PluginConfig;
    return data?.basic?.typstFontUrl || '';
  } catch (error) {
    console.error('获取 typstFontUrl 失败:', error);
    return '';
  }
};

// 获取插件配置中的 typstSelector
export const getTypstSelector = async (): Promise<string> => {
  try {
    const response = await consoleApiClient.plugin.plugin.fetchPluginJsonConfig({ name: pluginName });
    const data = response.data as PluginConfig;
    return data?.basic?.typstSelector || 'typst[data-type=typst]';
  } catch (error) {
    console.error('获取 typstSelector 失败:', error);
    return 'typst[data-type=typst]';
  }
};
