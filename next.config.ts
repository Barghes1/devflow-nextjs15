import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pino", "pino-pretty"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.freepik.com",
        pathname: "",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "",
      },
    ],
  },
};

export default nextConfig;
