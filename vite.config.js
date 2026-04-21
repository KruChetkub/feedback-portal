import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const gasUrl = new URL(env.VITE_API_URL || "https://script.google.com/macros/s/invalid/exec");
  const gasOrigin = `${gasUrl.protocol}//${gasUrl.host}`;
  const gasPathname = gasUrl.pathname;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api/gas": {
          target: gasOrigin,
          changeOrigin: true,
          secure: true,
          rewrite: () => gasPathname,
        },
      },
    },
  };
});
