import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true, 
      gzipSize: true,
      brotliSize: true, 
      filename: "stats.html", 
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: "static/js/chunk-[hash:16].js",
        entryFileNames: "static/js/[name]-[hash:16].js",
        assetFileNames: (assetInfo) => {
          if (
            assetInfo.type === "asset" &&
            /\.(jpe?g|png|gif|svg)$/i.test(assetInfo.name)
          ) {
            return "static/img/[hash:16].[ext]";
          }
          if (
            assetInfo.type === "asset" &&
            /\.(ttf|woff|woff2|eot)$/i.test(assetInfo.name)
          ) {
            return "static/fonts/[hash:16].[ext]";
          }
          return "static/[ext]/[hash:16].[ext]";
        },
        manualChunks: {
          antd:['antd','@ant-design/icons'],
          babel:['@babel/standalone'],
          'dooringx-lib':['dooringx-lib'],
          lodash:['lodash']
        },
      },
    },
  },
});
