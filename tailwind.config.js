/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
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

                // 更精细的断点
                'xs': '475px',   // 超小屏幕（小手机）
                '3xl': '1920px', // 超大桌面

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
                'desktop-wide': { 'raw': '(min-width: 1600px)' },
            },

            spacing: {
                // 保留默认间距值（1-16和20-96）
                '1': '0.25rem',    // 4px
                '2': '0.5rem',     // 8px
                '3': '0.75rem',    // 12px
                '4': '1rem',       // 16px
                '5': '1.25rem',    // 20px
                '6': '1.5rem',     // 24px
                '7': '1.75rem',    // 28px
                '8': '2rem',       // 32px
                '9': '2.25rem',    // 36px
                '10': '2.5rem',    // 40px
                '11': '2.75rem',   // 44px
                '12': '3rem',      // 48px
                '14': '3.5rem',    // 56px
                '16': '4rem',      // 64px
                '20': '5rem',      // 80px
                '24': '6rem',      // 96px
                '28': '7rem',      // 112px
                '32': '8rem',      // 128px
                '36': '9rem',      // 144px
                '40': '10rem',     // 160px
                '44': '11rem',     // 176px
                '48': '12rem',     // 192px
                '52': '13rem',     // 208px
                '56': '14rem',     // 224px
                '60': '15rem',     // 240px
                '64': '16rem',     // 256px
                '72': '18rem',     // 288px
                '80': '20rem',     // 320px
                '96': '24rem',     // 384px

                // 为横屏优化添加更小的间距选项
                '0.5': '0.125rem',  // 2px
                '1.5': '0.375rem',  // 6px
                '2.5': '0.625rem',  // 10px

                // 增加更多间距选项用于容器优化
                '18': '4.5rem',     // 72px
                '22': '5.5rem',     // 88px
                '26': '6.5rem',     // 104px
                '30': '7.5rem',     // 120px
                '34': '8.5rem',     // 136px
                '38': '9.5rem',     // 152px
                '42': '10.5rem',    // 168px
            },

            maxWidth: {
                // 容器最大宽度
                'container': '1400px',
                'content': '1200px',
                'narrow': '800px',
                'wide': '1600px',
            },

            // 优化字体大小
            fontSize: {
                '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
            },

            // 优化阴影
            boxShadow: {
                'sm-light': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                'md-light': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            },
        },
    },
    plugins: [],
}