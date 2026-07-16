const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/offline", // Serve our artistic offline page when a route is not cached
  },
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "**", port: "" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "**", port: "" },
      { protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "**", port: "" },
      { protocol: "https", hostname: "files.edgestore.dev", pathname: "**", port: "" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "**", port: "" },
      { protocol: "https", hostname: "images.pexels.com", pathname: "**", port: "" },
      { protocol: "https", hostname: "plus.unsplash.com", pathname: "**", port: "" },
      { protocol: "https", hostname: "api.slingacademy.com", pathname: "**", port: "" },
      { protocol: "https", hostname: "img.clerk.com", pathname: "**", port: "" },
      { protocol: "https", hostname: "clerk.com", pathname: "**", port: "" }
    ],
  },
  transpilePackages: ['geist'],
  cacheLife: {
    layout: {
      stale: 3600, // 1 hour
      revalidate: 60, // 1 minute
      expire: 86400, // 1 day
    },
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { 
            key: 'Content-Security-Policy', 
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://clerk.com https://*.clerk.com https://js.stripe.com https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: wss:; frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com;" 
          }
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);


// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "dan-richie",
  project: "javascript-nextjs",

  // Disable source map uploads to prevent build-time API failures on Vercel
  sourcemaps: {
    disable: true,
  },

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
