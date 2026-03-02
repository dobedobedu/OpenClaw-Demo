import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/visualization",
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
