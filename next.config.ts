import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    // Absolute project root — avoids resolving the lockfile in C:\Users\vicel
    root: path.join(__dirname),
  },
};

export default nextConfig;
