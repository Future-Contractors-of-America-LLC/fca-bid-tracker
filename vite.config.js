import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    chunkSizeWarningLimit: 600,
    modulePreload: {
      resolveDependencies(_filename, deps) {
        // Home and marketing routes should not block on the full academy chunk.
        return deps.filter((dep) => !dep.includes("academy-"));
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react/")) return "react-vendor";
            return "vendor";
          }
          if (
            id.includes("academyCatalog")
            || id.includes("academyOfferings")
            || id.includes("academyCatalogTaxonomy")
            || id.includes("academyPathwayLms")
          ) {
            return "academy-data";
          }
          if (!id.includes("src/pages")) return undefined;
          if (id.includes("src/pages/portal/PortalFieldSupervision")) return "portal-field";
          if (id.includes("src/pages/portal/PortalDesignWorkspace")) return "portal-design";
          if (id.includes("src/pages/portal/PortalFinance")) return "portal-finance";
          if (id.includes("src/pages/portal/PortalAdmin")) return "portal-admin";
          if (id.includes("src/pages/portal/PortalPipeline")) return "portal-pipeline";
          if (id.includes("src/pages/portal")) return "portal-core";
          if (id.includes("src/pages/academy")) return "academy";
          if (id.includes("src/pages/website")) return "website";
          return undefined;
        },
      },
    },
  },
  publicDir: "public",
});
