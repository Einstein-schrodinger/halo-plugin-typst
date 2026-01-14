<template>
  <div class="typst-preview-container">
    <!-- 渲染结果 -->
    <div 
      class="typst-preview-content" 
      v-html="typst.rendered" 
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { $typst } from '@myriaddreamin/typst.ts';
import setTypst from './set-typst.ts';
import { processTypstResources, type ResourceMappingResult } from './typst-resource-mapper.ts';

interface Props {
  content: string;
  autoRender?: boolean;
  debounceDelay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  autoRender: true,
  debounceDelay: 300,
});

// 响应式状态
const typst = reactive({
  rendered: '',
});

const error = ref<string | null>(null);
const isTypstInitialized = ref(false);

// 渲染函数
const doRender = async (content: string) => {
  // 检查内容
  if (!content?.trim()) {
    typst.rendered = '<p style="color: #999; font-style: italic;">请输入 Typst 代码</p>';
    return;
  }

  try {
    // 处理资源映射（图片和数据文件）
    const resourceResult: ResourceMappingResult = await processTypstResources(content);
    
    // 渲染 SVG
    const svg = await $typst.svg({ 
      mainContent: resourceResult.processedCode 
    });
    
    typst.rendered = svg;
    error.value = null;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    error.value = `渲染失败: ${errorMessage}`;
    
    // 显示错误信息
    typst.rendered = `
      <div class="typst-render-error">
        <h4>Typst 渲染错误</h4>
        <p>${error.value}</p>
        <p>请检查代码语法和资源链接是否正确。</p>
      </div>
    `;
  }
};

// 创建防抖渲染函数
const debouncedRender = useDebounceFn(async (content: string) => {
  // 检查 Typst 是否已初始化
  if (!isTypstInitialized.value) {
    console.warn('Typst 未初始化，跳过渲染');
    return;
  }
  
  await doRender(content);
}, props.debounceDelay);

// 初始化 Typst
const initTypst = async () => {
  if (isTypstInitialized.value) {
    return;
  }
  
  try {
    await setTypst();
    isTypstInitialized.value = true;
    console.log('Typst 初始化成功');
  } catch (initError) {
    console.error('Typst 初始化失败:', initError);
    error.value = `Typst 初始化失败: ${initError instanceof Error ? initError.message : '未知错误'}`;
    isTypstInitialized.value = false;
    
    // 初始化失败时也显示错误信息
    typst.rendered = `
      <div class="typst-render-error">
        <h4>Typst 初始化失败</h4>
        <p>${error.value}</p>
        <p>请检查 Typst 配置是否正确。</p>
      </div>
    `;
  }
};

// 立即渲染（无防抖）
const renderImmediately = async (content: string) => {
  if (!isTypstInitialized.value) {
    await initTypst();
  }
  
  await doRender(content);
};

// 组件挂载
onMounted(async () => {
  await initTypst();
  
  if (props.autoRender && props.content) {
    await debouncedRender(props.content);
  }
});

// 监听内容变化
watch(() => props.content, async (newVal) => {
  if (props.autoRender) {
    await debouncedRender(newVal);
  }
}, {
  immediate: false
});

// 监听 autoRender 变化
watch(() => props.autoRender, (newVal) => {
  if (newVal && props.content) {
    debouncedRender(props.content);
  }
});

// 暴露方法给父组件
defineExpose({
  renderImmediately,
  renderTypst: debouncedRender,
  error
});
</script>

<style scoped>
.typst-preview-container {
  position: relative;
  width: 100%;
  min-height: 100px;
}

.typst-preview-content {
  width: 100%;
}

.typst-preview-content svg {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}
</style>
<style>
  /* 渲染错误样式 */
.typst-preview-content .typst-render-error {
  padding: 20px;
  border: 1px solid #ffcccc;
  background: #fff5f5;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
}

.typst-preview-content .typst-render-error h4 {
  color: #d32f2f;
  margin-top: 0;
  margin-bottom: 10px;
}

.typst-preview-content .typst-render-error p {
  margin: 5px 0;
  color: #666;
}
</style>
