/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Allow Cloudinary images
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Allow Google profile images
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com', // Allow Facebook profile images
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Allow placeholder images (if you use them for testing)
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;