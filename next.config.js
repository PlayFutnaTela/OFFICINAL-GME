/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                // Usar wildcard simples para evitar glob recursivo em micromatch
                hostname: '*.supabase.co',
            },
        ],
        unoptimized: true, // Allow local images to be served without optimization
        formats: ['image/avif', 'image/webp'],
    },
    experimental: {
        // Reduz a superfície de rastreamento para evitar loops de micromatch na coleta de build traces
        outputFileTracingRoot: __dirname,
        outputFileTracingExcludes: {
            '*': [
                '**/backend/**',
                '**/Upgrade/**',
                '**/*.sql',
                '**/*.md',
                '**/public/slide-desktop/**',
                '**/public/slide-mobile/**',
                '**/public/slide-footer/**',
            ],
        },
    },
}

module.exports = nextConfig
