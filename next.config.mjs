/** @type {import('next').NextConfig} */
const nextConfig = {
  // Streaming chat + intro effect behave more predictably without double-invoke in dev.
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.cal.com https://cal.com https://assets.calendly.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: https://assets.calendly.com; font-src 'self' data:; connect-src 'self' https://dealflow-ai-651cb.firebaseio.com https://dealflow-ai-651cb.appspot.com https://api.huggingface.co https://calendly.com; frame-src https://app.cal.com https://cal.com https://calendly.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
