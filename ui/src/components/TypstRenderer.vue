<template>
  <div class="typst-content" v-html="typst.compiled" />
</template>

<script setup lang="ts">
import { reactive, onMounted, watch } from 'vue';
import { $typst } from '@myriaddreamin/typst.ts';

interface prop {
  content: string;
}

const typst = reactive({
  compiled: '',
});

const props = withDefaults(defineProps<prop>(), {
  content: '',
});

// Prevents reinitialization of compiler and renderer options during HMR (Hot Module Replacement).
// Use prepareUseOnce flag ensures initialization occurs only once to avoid duplicate calls to setXXXInitOptions.
let inited = false;

const setTypst = () => {
  if (!inited) {
    $typst.setCompilerInitOptions({
      beforeBuild: [],
      getModule: () =>
        new URL(
          '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm',
          import.meta.url
        ).toString(),
    });

    $typst.setRendererInitOptions({
      beforeBuild: [],
      getModule: () =>
        new URL(
          '@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm',
          import.meta.url
        ).toString(),
    });
    inited = true;
  }
};

const renderTypst = async (content: string) => {
  try {
    if (content && content.trim()) {
      typst.compiled = await $typst.svg({ mainContent: content });
    } else {
      typst.compiled = '<p style="color: #999; font-style: italic;">请输入 Typst 代码</p>';
    }
  } catch (error) {
    console.error('Typst rendering error:', error);
    typst.compiled = `<p style="color: red; font-size: 14px;">Typst 渲染错误: ${error instanceof Error ? error.message : '未知错误'}</p>`;
  }
};

onMounted(async () => {
  try {
    setTypst();
    await renderTypst(props.content);
  } catch (error) {
    console.error('Typst initialization error:', error);
    typst.compiled = `<p style="color: red;">Typst 初始化失败: ${error instanceof Error ? error.message : '未知错误'}</p>`;
  }
});

watch(() => props.content, async (newVal) => {
  await renderTypst(newVal);
});
</script>

<style scoped>
.typst-content svg {
  max-width: 100%;
  height: auto;
}
</style>