import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true';
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isProjectPages = Boolean(repositoryName && !configuredBasePath);
const basePath = configuredBasePath || (isGithubPages && isProjectPages ? `/${repositoryName}` : '');

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

const nextConfig = {
  poweredByHeader: false,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  turbopack: {
    root: currentDir
  },
  ...(isGithubPages
    ? {
        basePath,
        assetPrefix: basePath || undefined
      }
    : {})
};

export default nextConfig;
