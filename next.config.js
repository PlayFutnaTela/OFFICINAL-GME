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
}

module.exports = nextConfig
