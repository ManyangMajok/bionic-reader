import path from "path";
import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

const conditionalPlugins: [string, Record<string, any>][] = [];

// @ts-ignore
if (process.env.TEMPO === "true") {
  /* conditionalPlugins.push(["tempo-devtools/swc", {}]) [deprecated] */
}

export default defineConfig({
  base:
    process.env.NODE_ENV === "development"
      ? "/"
      : process.env.VITE_BASE_PATH || "/",

  optimizeDeps: {
    force: true,
    include: ["tesseract.js", "mammoth", "@supabase/supabase-js"],
    exclude: ["pdfjs-dist", "jspdf", "pdf-parse", "canvas", "jsdom"],
  },

  // ✅ Explicitly tell TS the array is PluginOption[]
  plugins: [
    react({ plugins: conditionalPlugins }),
    tempo() as unknown as PluginOption,
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json"],
  },

  server: {
    allowedHosts: true,
    fs: { strict: false },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    rollupOptions: {
      external: (id) =>
        id.includes("pdf-parse") ||
        id.includes("canvas") ||
        id.includes("jsdom") ||
        id.includes("tesseract.js/dist/worker") ||
        id.includes("pdfjs-dist/build/pdf.worker"),
    },
    commonjsOptions: { ignoreTryCatch: false },
  },
});
