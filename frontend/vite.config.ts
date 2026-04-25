import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: parseInt(process.env.VITE_PORT || "3000", 10),
    proxy: {
      "/api": {
        target: `http://${process.env.VITE_API_HOST}:${process.env.VITE_API_PORT}`,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: false,
      },
      "/ws": {
        target: `ws://${process.env.VITE_API_HOST}:${process.env.VITE_API_PORT}`,
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ws/, ""),
        secure: false,
      },
    },
  },
});
