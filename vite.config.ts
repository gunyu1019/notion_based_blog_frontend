import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueJsx(),
        Components({
            resolvers: [BootstrapVueNextResolver()]
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                // Sass Legacy API 및 import 경고 숨김
                silenceDeprecations: ['legacy-js-api', 'import'],
                // 외부 의존성의 경고도 숨김
                quietDeps: true
            }
        }
    },
    server: {
        // 개발 서버 포트 설정
        port: 5173,
        host: true, // 네트워크에서 접근 가능하도록 설정
        // CORS 해결을 위한 프록시 설정
        proxy: {
            '/api': {
                target: process.env.VITE_API_TARGET || 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
                // API 경로를 백엔드에 맞게 변경 (/api 제거)
                rewrite: (path) => path.replace(/^\/api/, ''),
                configure: (proxy) => {
                    proxy.on('error', (err) => {
                        console.log('프록시 오류:', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req) => {
                        console.log('프록시 요청 전송:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req) => {
                        console.log('프록시 응답 수신:', proxyRes.statusCode, req.url);
                    });
                }
            }
        },
        // CORS 설정 (추가적인 보안)
        cors: true
    }
})
