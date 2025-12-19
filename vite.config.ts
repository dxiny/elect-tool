import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  base: "./",
  server: {
    proxy: {
      '/socket.io': {
        target: 'http://116.62.133.219:3000',
        changeOrigin: true,
        ws: true,
        secure: false
      }
    }
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
  }
});
