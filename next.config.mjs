import path from "node:path";
import { fileURLToPath } from "node:url";

// Absolute app root for Turbopack when another lockfile exists higher on the drive.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
