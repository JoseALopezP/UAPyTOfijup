/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    images: {
        unoptimized: true
    },
    experimental: {
        serverComponentsExternalPackages: ["puppeteer"]
    }
};

export default nextConfig;
