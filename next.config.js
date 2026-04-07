/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    images: {
        unoptimized: true
    },
    serverExternalPackages: ["puppeteer"],
    experimental: {
        serverComponentsExternalPackages: ["puppeteer"]
    }
};

export default nextConfig;
