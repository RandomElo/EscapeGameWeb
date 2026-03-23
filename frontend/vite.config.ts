import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [react()],
        server: {
            allowedHosts: ["escape-game.pizza"],
            port: parseInt(env.VITE_PORT_APPLICATION) || 5173,
            proxy: {
                "/admins": {
                    target: env.VITE_API_URL_BACKEND,
                    changeOrigin: true,
                    secure: false,  
                },
                "/utilisateurs": {
                    target: env.VITE_API_URL_BACKEND,
                    changeOrigin: true,
                    secure: false,
                },
                "/equipes": {
                    target: env.VITE_API_URL_BACKEND,
                    changeOrigin: true,
                    secure: false,
                },
                "/classements": {
                    target: env.VITE_API_URL_BACKEND,
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    };
});
