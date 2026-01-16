<template>
  <div class="typst-preview-container">
    <!-- 渲染结果 -->
    <div class="typst-preview-content" v-html="rendered" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import setTypst from './set-typst.ts'
import { renderTypst } from './render.typst.ts'
import { type NodeViewProps } from '@halo-dev/richtext-editor'

const props = defineProps<NodeViewProps & { autoRender: boolean }>()

const content = computed<string>(() => props.node.attrs.content)
const rendered = computed<string>({
  get() {
    return props.node.attrs.svg
  },
  set(value) {
    props.updateAttributes({ svg: value })
  },
})

const error = ref<string | null>(null)
const isTypstInitialized = ref(false)

// 创建防抖渲染函数
const debouncedRender = useDebounceFn(async (content: string) => {
  // 检查 Typst 是否已初始化
  if (!isTypstInitialized.value) {
    console.warn('Typst 未初始化，跳过渲染')
    return
  }

  rendered.value = await renderTypst(content)
}, 300)

// 初始化 Typst
const initTypst = async () => {
  if (isTypstInitialized.value) {
    return
  }

  try {
    await setTypst()
    isTypstInitialized.value = true
  } catch (initError) {
    console.error('Typst 初始化失败:', initError)
    error.value = `Typst 初始化失败: ${initError instanceof Error ? initError.message : '未知错误'}`
    isTypstInitialized.value = false

    // 初始化失败时也显示错误信息
    rendered.value = `
      <div class="typst-render-error">
        <h4>Typst 初始化失败</h4>
        <p>${error.value}</p>
        <p>请检查 Typst 配置是否正确。</p>
      </div>
    `
  }
}

onMounted(async () => {
  await initTypst()

  if (rendered.value) {
    return
  }

  if (props.autoRender && content.value) {
    await debouncedRender(content.value)
  }
})

// 监听内容变化
watch(
  () => content.value,
  async (newVal) => {
    console.log('newVal', newVal)
    if (props.autoRender) {
      await debouncedRender(newVal)
    }
  },
  {
    immediate: false,
  },
)

// 监听 autoRender 变化
watch(
  () => props.autoRender,
  (newVal) => {
    if (newVal && content.value) {
      debouncedRender(content.value)
    }
  },
)
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
