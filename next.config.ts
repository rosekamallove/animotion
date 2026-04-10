import path from "path";
import type { NextConfig } from "next";

const generatedPath = path.resolve(__dirname, "remotion/src/generated");
const rootNodeModules = path.resolve(__dirname, "node_modules");

const nextConfig: NextConfig = {
  transpilePackages: ["remotion", "@remotion/player", "@remotion/google-fonts", "shiki"],
  turbopack: {
    resolveAlias: {
      "@generated": "./remotion/src/generated",
      // Deduplicate: force generated components to use root remotion (not remotion/node_modules/remotion)
      "remotion": "./node_modules/remotion",
      "@remotion/google-fonts": "./node_modules/@remotion/google-fonts",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@generated": generatedPath,
      "remotion": path.join(rootNodeModules, "remotion"),
      "@remotion/player": path.join(rootNodeModules, "@remotion/player"),
      "@remotion/google-fonts": path.join(rootNodeModules, "@remotion/google-fonts"),
      "react": path.join(rootNodeModules, "react"),
      "react-dom": path.join(rootNodeModules, "react-dom"),
    };
    return config;
  },
};

export default nextConfig;
