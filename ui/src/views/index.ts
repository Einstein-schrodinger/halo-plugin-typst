import {
  type Editor,
  mergeAttributes,
  Node,
  type Range,
  VueNodeViewRenderer,
  ToolboxItem,
  type ExtensionOptions,
} from '@halo-dev/richtext-editor'
import TypstView from './TypstView.vue'
import { markRaw } from 'vue'
import icon from '~icons/simple-icons/typst'

export const ExtensionTypst = Node.create<ExtensionOptions>({
  name: 'typst',
  inline: false,
  group: 'block',
  code: true,
  atom: true,

  addAttributes() {
    return {
      content: {
        default:
          '#set page(width:auto, height:auto, margin: 10pt)\n#set text(16pt)\n= Hello Typst!\n',
        parseHTML(element) {
          if (element.hasAttribute('content')) {
            return element.getAttribute('content') || ''
          }
          return null
        },
      },
      svg: {
        default: null,
        rendered: false,
        parseHTML(element) {
          if (!element.firstElementChild) {
            return null
          }
          if (element.firstElementChild.tagName === 'svg') {
            return element.firstElementChild.outerHTML
          }
          return null
        },
      },
    }
  },
  parseHTML() {
    return [
      {
        tag: 'typst[data-type="typst"]',
      },
    ]
  },
  renderHTML({ HTMLAttributes, node }) {
    const svg = node.attrs.svg
    if (svg) {
      const typst = document.createElement('typst')
      typst.setAttribute('data-type', 'typst')
      typst.setAttribute('content', node.attrs.content)
      typst.innerHTML = svg
      return { dom: typst }
    }
    return [
      'typst[data-type="typst"]',
      mergeAttributes({
        ...HTMLAttributes,
      }),
    ]
  },
  addNodeView() {
    return VueNodeViewRenderer(TypstView)
  },
  addOptions() {
    return {
      ...this.parent?.(),
      getToolboxItems({ editor }: { editor: Editor }) {
        return [
          {
            priority: 100,
            component: markRaw(ToolboxItem),
            props: {
              editor,
              icon: markRaw(icon),
              title: 'Typst 编辑块',
              action: () => {
                editor
                  .chain()
                  .focus()
                  .insertContent({
                    type: 'typst',
                  })
                  .run()
              },
            },
          },
        ]
      },
      getCommandMenuItems() {
        return {
          priority: 100,
          icon: markRaw(icon),
          title: 'Typst 编辑块',
          keywords: ['typst'],
          command: ({ editor, range }: { editor: Editor; range: Range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertContent({
                type: 'typst',
              })
              .run()
          },
        }
      },
    }
  },
})
