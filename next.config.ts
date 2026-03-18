import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/horizon-tracker",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
