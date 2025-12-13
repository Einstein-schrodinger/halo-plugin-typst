<template>
  <div class="typst-content" v-html="typst.rendered" />
</template>

<script setup lang="ts">
import { reactive, onMounted, watch } from 'vue';
import { $typst } from '@myriaddreamin/typst.ts';
import setTypst from './set-typst.ts';

interface prop {
  content: string;
}

const typst = reactive({
  rendered: '',
});

const props = withDefaults(defineProps<prop>(), {
  content: '',
});

const renderTypst = async (content: string) => {
  try {
    if (content && content.trim()) {
      typst.rendered = await $typst.svg({ mainContent: content });
    } else {
      typst.rendered = '<p style="color: #999; font-style: italic;">请输入 Typst 代码</p>';
    }
  } catch (error) {
    console.error('Typst rendering error:', error);
    typst.rendered = `<p style="color: red; font-size: 14px;">Typst 渲染错误: ${error instanceof Error ? error.message : '未知错误'}</p>`;
  }
};

onMounted(async () => {
  try {
    await setTypst();
    await renderTypst(props.content);
  } catch (error) {
    console.error('Typst initialization or rendering failed:', error);
    // 即使初始化失败，也尝试渲染内容
    await renderTypst(props.content);
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