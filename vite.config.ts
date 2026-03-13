import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { cpSync } from "fs";

function safePublicCopy(): import("vite").Plugin {
  const SKIP = ["CareView_logo_1_colored_highres copy.png"];
  return {
    name: "safe-public-copy",
    apply: "build",
    config(cfg) {
      cfg.build = cfg.build ?? {};
      cfg.build.copyPublicDir = false;
    },
    writeBundle(opts) {
      const outDir = opts.dir ?? "dist";
      const publicDir = path.resolve(__dirname, "public");
      const entries = fs.readdirSync(publicDir);
      for (const entry of entries) {
        if (SKIP.includes(entry)) continue;
        try {
          const src = path.join(publicDir, entry);
          const dst = path.join(outDir, entry);
          const stat = fs.statSync(src);
          if (stat.isDirectory()) {
            cpSync(src, dst, { recursive: true });
          } else {
            fs.copyFileSync(src, dst);
          }
        } catch {}
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), safePublicCopy()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'doc-export': ['docx', 'file-saver'],
          'ui-icons': ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
