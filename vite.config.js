import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  base: "./",
  plugins: [viteSingleFile()],
  server: {
    port: 3110,
    strictPort: true,
  },
  preview: {
    port: 3110,
    strictPort: true,
  },
  build: {
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
  },
});
