/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow importing from parent directories (src/ and dist/)
  experimental: {
    externalDir: true,
  },
  // Transpile the local source files
  transpilePackages: ['../src', '../dist'],
}

export default nextConfig
