import type { NextConfig } from "next";

/**
 * Next.js configuration.
 * Every route is statically generated; nothing here needs a server at runtime.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },

  // The stylesheet is small, so inline it into the HTML instead of a render-blocking request.
  // Measured: this is what held back first paint on mobile Lighthouse runs.
  experimental: { inlineCss: true },

  // Short, memorable résumé URL: /resume -> the PDF.
  async redirects() {
    return [
      { source: "/resume", destination: "/resume/prateek-sharma-resume.pdf", permanent: false },
    ];
  },
};

export default nextConfig;
