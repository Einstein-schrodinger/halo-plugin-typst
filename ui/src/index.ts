import { definePlugin } from "@halo-dev/console-shared";
import "./assets/typst-renderer.css";

export default definePlugin({
  components: {},
  routes: [],
  extensionPoints: {
    "default:editor:extension:create": async () => {
      const { ExtensionTypst } = await import("./views");
      return [ExtensionTypst];
    },
  },
});
