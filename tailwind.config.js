/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            screens: {
                // 默认断点
                'sm': '640px',   // 小型设备（手机横屏、小平板）
                'md': '768px',   // 中型设备（平板竖屏）
                'lg': '1024px',  // 大型设备（平板横屏、小型桌面）
                'xl': '1280px',  // 超大设备（桌面）
                '2xl': '1536px', // 超超大设备（大型桌面）

                // 自定义断点 - 方向相关
                'portrait': { 'raw': '(orientation: portrait)' },
                'landscape': { 'raw': '(orientation: landscape)' },

                // 自定义断点 - 高度相关（用于横屏优化）
                'h-sm': { 'raw': '(min-height: 500px)' },
                'h-md': { 'raw': '(min-height: 700px)' },
                'h-lg': { 'raw': '(min-height: 900px)' },

                // 组合断点 - 特定场景
                'mobile-landscape': { 'raw': '(max-width: 767px) and (orientation: landscape)' },
                'tablet-landscape': { 'raw': '(min-width: 768px) and (max-width: 1023px) and (orientation: landscape)' },
            },

            spacing: {
                // 为横屏优化添加更小的间距选项
                '0.5': '0.125rem',  // 2px
                '1.5': '0.375rem',  // 6px
                '2.5': '0.625rem',  // 10px
            },

            maxWidth: {
                // 容器最大宽度
                'container': '1400px',
            },
        },
    },
    plugins: [],
}