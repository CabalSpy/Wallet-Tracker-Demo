/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cabalspy.xyz' },
      { protocol: 'https', hostname: 'www.cabalspy.xyz' },
    ],
    unoptimized: true,
  },
}
module.exports = nextConfig
