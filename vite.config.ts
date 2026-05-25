import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2019",
    lib: {
      entry: resolve(__dirname, "src/entrypoints/google-sheet/google-sheet.ts"),
      name: "GoogleSheetScript",
      formats: ["iife"],
      fileName: () => "app.js",
    },
    outDir: "google-drive-dist",
    // we can't clean directory as it has clasp files
    emptyOutDir: false,
    minify: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        footer: `
function main() {
  return GoogleSheetScript.runJustJoinArchive();
}
`,
      },
    },
  },
});
