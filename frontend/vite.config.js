import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite設定：Reactプラグインを使用してHMR（ホットリロード）を有効化
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
