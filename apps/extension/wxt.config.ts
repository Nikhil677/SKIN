import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "SKIN — Adaptive Web Accessibility",
    description: "Transform complex websites into simpler, adaptive, personalized interfaces while preserving the original webpage as the backend.",
    version: "1.0.0",
    permissions: ["activeTab", "storage", "scripting"],
    action: {
      default_title: "Activate SKIN",
    },
  },
});
