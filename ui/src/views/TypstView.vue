<script lang="ts" setup>
import { nodeViewProps, NodeViewWrapper } from '@halo-dev/richtext-editor'
import { onMounted, ref, watch, nextTick } from 'vue'
import { useDebounceFn, useMagicKeys } from '@vueuse/core'
import IcOutlineFullscreen from '~icons/ic/outline-fullscreen'
import IcOutlineFullscreenExit from '~icons/ic/outline-fullscreen-exit'
import IcOutlineTipsAndUpdates from '~icons/ic/outline-tips-and-updates'
import TypstRenderer from '@/components/TypstRenderer.vue'

const props = defineProps(nodeViewProps)
const fullscreen = ref(false)
const collapsed = ref(false)
const minHeight = ref(120) // 3-5行的高度（约120px）
const currentHeight = ref(minHeight.value)
const isEditing = ref(false)

// 高度调整函数（非防抖版本）
function adjustHeightByContent(content: string) {
  if (collapsed.value || fullscreen.value) return

  if (!content) {
    // 内容为空时恢复到最小高度
    currentHeight.value = minHeight.value
    return
  }

  const lines = content.split('\n').length
  const estimatedHeight = Math.max(minHeight.value, lines * 24) // 每行约24px
  const maxHeight = 400 // 最大高度限制
  currentHeight.value = Math.min(estimatedHeight, maxHeight)
}

// 创建防抖函数
const debouncedAdjustHeight = useDebounceFn(adjustHeightByContent, 150)

// typst editor
function onEditorChange(value: string) {
  try {
    props.updateAttributes({ content: value })
    // 使用防抖函数调整高度
    debouncedAdjustHeight(value)
  } catch (error) {
    console.error('Failed to update Typst content:', error)
  }
}

// 监听折叠状态变化
watch(collapsed, (newCollapsed) => {
  if (!newCollapsed && !fullscreen.value) {
    // 展开时重新计算高度
    const content = props.node.attrs.content || ''
    if (content) {
      debouncedAdjustHeight(content)
    }
  }
})

// 监听全屏状态变化
watch(fullscreen, (newFullscreen) => {
  if (newFullscreen) {
    // 进入全屏时自动展开
    collapsed.value = false
  } else {
    // 退出全屏时，等待 DOM 更新后重新计算高度
    nextTick(() => {
      if (!collapsed.value) {
        const content = props.node.attrs.content || ''
        if (content) {
          adjustHeightByContent(content) // 直接调用，不需要防抖
        }
      }
    })
  }
})

// ESC 键退出全屏
const { escape } = useMagicKeys()

watch(escape, (value) => {
  if (value && fullscreen.value) {
    fullscreen.value = false;
  }
})

// 监听编辑器焦点事件
function onEditorFocus() {
  isEditing.value = true
}

function onEditorBlur() {
  isEditing.value = false
  // 如果不在编辑状态且内容较少，恢复到最小高度
  const content = props.node.attrs.content || ''
  if (content.split('\n').length <= 5) {
    currentHeight.value = minHeight.value
  }
}

onMounted(() => {  
  // 初始化高度
  const initialContent = props.node.attrs.content || ''
  if (initialContent && !collapsed.value && !fullscreen.value) {
    adjustHeightByContent(initialContent) // 直接调用，不需要防抖
  }
})

// 监听内容变化
watch(
  () => props.node.attrs.content,
  (newContent) => {
    if (newContent && !collapsed.value && !fullscreen.value) {
      debouncedAdjustHeight(newContent)
    }
  },
  { immediate: true }
)
</script>

<template>
  <node-view-wrapper class="typst-container" :class="{ 'typst-fullscreen': fullscreen }">
    <div class="typst-nav">
      <div class="typst-nav-start">
        <div>Typst 编辑块</div>
        <a v-tooltip="`查阅 Typst 的文档`" href="https://typst.app/docs/" target="_blank">
          <IcOutlineTipsAndUpdates />
        </a>
      </div>
      <div class="typst-nav-end">
        <div v-if="!fullscreen" class="typst-collapse-icon" @click="collapsed = !collapsed">
          <svg
            v-if="collapsed"
            v-tooltip="'展开'"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          <svg
            v-else
            v-tooltip="'折叠'"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </div>
        <div class="typst-fullscreen-icon" @click="fullscreen = !fullscreen">
          <IcOutlineFullscreenExit v-if="fullscreen" v-tooltip="'退出全屏'" />
          <IcOutlineFullscreen v-else v-tooltip="'全屏'" />
        </div>
      </div>
    </div>
    <div v-if="collapsed && !fullscreen" class="typst-collapsed-hint">
      <span>Typst 编辑块已折叠</span>
    </div>
    <div
      class="typst-editor-panel"
      :class="{ 'typst-collapsed': collapsed && !fullscreen }"
      :style="{
        height: collapsed && !fullscreen ? '0px' : fullscreen ? '100%' : currentHeight + 'px',
      }"
    >
      <div class="typst-code">
        <VCodemirror
          :model-value="props.node.attrs.content || ''"
          height="100%"
          language="yaml"
          @change="onEditorChange"
          @focus="onEditorFocus"
          @blur="onEditorBlur"
        />
      </div>
      <div class="typst-preview" contenteditable="false">
        <TypstRenderer v-bind="props" auto-render />
      </div>
    </div>
  </node-view-wrapper>
</template>

<style>
.typst-container {
  border: 1px #e7e7e7 solid;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.75em;
  transition: height 0.3s ease;
}

.typst-nav {
  border-bottom: 1px #e7e7e7 solid;
  display: flex;
  padding: 5px 10px;
  align-items: center;
}

.typst-nav-start {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.typst-nav-end {
  justify-content: flex-end;
  display: flex;
  align-items: center;
  gap: 8px;
}

.typst-editor-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  height: 100%;
  transition: height 0.3s ease;
  overflow: hidden;
}

.typst-editor-panel.typst-collapsed {
  height: 0px !important;
}

.typst-code {
  height: 100%;
  border-right: 1px #e7e7e7 solid;
  overflow-y: auto;
  overflow-x: hidden;
}

.typst-preview {
  user-select: none;
  padding: 5px;
  height: 100%;
  overflow: auto;
}

.typst-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  background: #fff;
  margin-top: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.typst-fullscreen .typst-nav {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #fff;
  border-bottom: 1px solid #e7e7e7;
}

.typst-fullscreen .typst-editor-panel {
  flex: 1;
  height: auto !important;
  min-height: 0;
  overflow: hidden;
}

.typst-fullscreen .typst-code,
.typst-fullscreen .typst-preview {
  overflow: auto;
}

.typst-fullscreen-icon {
  cursor: pointer;
}

.typst-fullscreen-icon svg {
  font-size: 18px;
}

.typst-collapse-icon {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.typst-collapse-icon:hover {
  background-color: #f5f5f5;
  color: #666;
}

.typst-collapse-icon svg {
  font-size: 14px;
}

.typst-collapsed-hint {
  padding: 8px 10px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  font-size: 12px;
  color: #6c757d;
  text-align: center;
}

.typst-fullscreen-icon:hover {
  color: #999;
}
</style>
