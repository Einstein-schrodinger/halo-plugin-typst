import {
  type Editor,
  mergeAttributes,
  Node,
  type Range,
  VueNodeViewRenderer,
  ToolboxItem,
} from "@halo-dev/richtext-editor";
import TypstView from "./TypstView.vue";
import { markRaw } from "vue";
import icon from "~icons/simple-icons/typst";

export type TypstOptions = {
  HTMLAttributes: Record<string, any>;
};

export const ExtensionTypst = Node.create<TypstOptions>({
  name: "typst",
  inline: false,
  content: "",
  marks: "",
  group: "block",
  code: true,
  atom: true,
  defining: true,
  addAttributes() {
    return {
      content: {
        default: "",
        parseHTML: (element: Element) => element.getAttribute("data-content"),
        renderHTML: (attributes: Record<string, any>) => {
          return !attributes.content
            ? {}
            : {
                "data-content": attributes.content,
              };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "typst[data-type=\"typst\"]",
      },
    ];
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return [
      "typst",
      mergeAttributes({
        "data-type": "typst",
        "data-content": HTMLAttributes["data-content"],
        ...HTMLAttributes
      })
    ];
  },
  addNodeView() {
    return VueNodeViewRenderer(TypstView);
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
              title: "Typst 编辑块",
              action: () => {
                editor
                  .chain()
                  .focus()
                  .insertContent({ type: "typst", attrs: { content: "#set page(width:auto, height:auto, margin: 10pt)\n#set text(16pt)\n= Hello Typst!\n" } })
                  .run();
              },
            },
          },
        ];
      },
      // 扩展指令项
      getCommandMenuItems() {
        return {
          priority: 100,
          icon: markRaw(icon),
          title: "Typst 编辑块",
          keywords: ["typst"],
          command: ({ editor, range }: { editor: Editor; range: Range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertContent({ type: "typst", attrs: { content: "#set page(width:auto, height:auto, margin: 10pt)\n#set text(16pt)\n= Hello Typst!\n" } })
              .run();
          },
        };
      },
    };
  },
});