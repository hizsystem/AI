import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/tabshopbar",
        destination: "/clients/tabshopbar",
        permanent: false,
      },
      {
        source: "/huenic",
        destination: "/clients/huenic",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
