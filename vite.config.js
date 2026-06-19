import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("src/pages")) return undefined;
          if (id.includes("src/pages/portal")) return "portal";
          if (id.includes("src/pages/academy")) return "academy";
          if (id.includes("src/pages/website")) return "website";
          return undefined;
        },
      },
    },
  },
  publicDir: "public",
});
