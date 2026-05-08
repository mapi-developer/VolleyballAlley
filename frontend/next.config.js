/** @type {import('next').NextConfig} */
const nextConfig = {
  // This allows the Next.js dev server to accept connections from ngrok
  experimental: {
    allowedDevOrigins: ['smelting-helpline-botanist.ngrok-free.dev'],
  },
};

module.exports = nextConfig;