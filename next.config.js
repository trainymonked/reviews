// @ts-check

/**
 * @type {import('next').NextConfig}
 **/

const nextConfig = {
    async redirects() {
        return [
            {
                source: '/reviews',
                destination: '/',
                permanent: true,
            },
        ]
    },
    reactStrictMode: true,
    i18n: {
        locales: ['en', 'ru'],
        defaultLocale: 'en',
    },
    experimental: {
        forceSwcTransforms: true,
    },
}

module.exports = nextConfig
