import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //  development only
  allowedDevOrigins: ["10.51.74.97", "192.168.0.*", "192.168.1.*"],
};

export default nextConfig;
