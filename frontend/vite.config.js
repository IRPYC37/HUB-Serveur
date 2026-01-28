import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0",      // écoute toutes les interfaces
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "hub.cyprienfournier.com",
      "cyprienfournier.com",
      "hub-api.cyprienfournier.com"
    ]
  }
});
