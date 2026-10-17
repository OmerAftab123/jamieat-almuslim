/** @type {import('next').NextConfig} */
// Static export for GitHub Pages (and any static host).
// BASE_PATH is set by the Pages workflow to "/<repo-name>" for project sites,
// and left empty for local development and for user/org root sites.
const basePath = process.env.BASE_PATH || '';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default nextConfig;
