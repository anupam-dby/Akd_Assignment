import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:3000", // Update to the backend server's port
                changeOrigin: true,
                secure: false,
            },
        },
    },
});