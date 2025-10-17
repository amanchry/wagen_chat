/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_GEOSERVER_URL: process.env.NEXT_PUBLIC_GEOSERVER_URL,
  },
  mages: {
    domains: [
      "geoserver.waterinag.org",
    ],
  },
};

export default nextConfig;
