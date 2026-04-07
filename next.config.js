/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    images: {
        unoptimized: true
    },
    experimental: {
        serverComponentsExternalPackages: ["puppeteer"]
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            // Mark puppeteer as external so webpack doesn't try to bundle it
            config.externals = config.externals || [];
            config.externals.push('puppeteer');
        }
        return config;
    }
};

export default nextConfig;
