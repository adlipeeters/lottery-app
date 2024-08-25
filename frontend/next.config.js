// next.config.js

module.exports = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**', // This allows all domains
            },
        ],
    },
}
