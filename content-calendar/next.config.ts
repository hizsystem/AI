import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Short URLs → client pages (clean share links)
      { source: "/huenic", destination: "/clients/huenic", permanent: false },
      { source: "/mirye-gukbap", destination: "/clients/mirye-gukbap", permanent: false },
      { source: "/dancingcup", destination: "/clients/dancingcup", permanent: false },
      { source: "/goventure", destination: "/clients/goventure", permanent: false },
      { source: "/brandrise", destination: "/clients/brandrise", permanent: false },
      { source: "/hdoilbank", destination: "/clients/hdoilbank", permanent: false },
      { source: "/myeongdong", destination: "/clients/myeongdong", permanent: false },
      { source: "/tabshopbar", destination: "/clients/tabshopbar", permanent: false },
    ];
  },
};

export default nextConfig;
