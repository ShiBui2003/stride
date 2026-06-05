// Next.js config — next-pwa for offline/SW; Cloudflare Pages compatible build.
import nextPWA from 'next-pwa';

// Cloudflare sets CF_PAGES=1 during its build. On that runtime next-pwa's workbox
// output conflicts with the next-on-pages adapter, so the service worker is disabled
// there. Local `next build` / `next dev` are unaffected and keep full PWA support.
const isCloudflare = process.env.CF_PAGES === '1';

const withPWA = nextPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development' || isCloudflare,
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cloudflare Pages doesn't run Next's image optimizer — serve images unoptimized there.
    unoptimized: isCloudflare,
    // Allow Supabase storage domain for avatar images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default withPWA(nextConfig);
