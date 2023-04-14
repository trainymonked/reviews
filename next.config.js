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
}

module.exports = nextConfig
