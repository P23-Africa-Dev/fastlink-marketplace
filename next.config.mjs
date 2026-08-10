/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/local-stores",
        destination: "/malls",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
