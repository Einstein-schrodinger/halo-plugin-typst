import { definePlugin } from "@halo-dev/ui-shared";
import "./style/index.css";

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
