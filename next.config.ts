import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

// Content-Security-Policy. The high-value, no-breakage directives are the point
// here: `frame-ancestors 'none'` (clickjacking — the login page can no longer be
// framed), plus `base-uri`, `object-src`, and `form-action` lockdowns.
//
// NOTE: without per-request nonces (which require middleware) `script-src` still
// needs `'unsafe-inline'` for Next.js's bootstrap scripts, so this CSP is not a
// hardened XSS defense. Dev additionally needs `'unsafe-eval'` and a websocket
// connection for HMR. A nonce-based strict CSP is a larger, separate change.
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: https://*.googleusercontent.com`,
  `font-src 'self'`,
  `connect-src 'self'${isDev ? ' ws:' : ''}`,
  `frame-src 'none'`,
  `frame-ancestors 'none'`,
  `form-action 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  // Defense in depth alongside CSP frame-ancestors for older browsers.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  },
  // 2 years, all subdomains, preload-eligible. Browsers ignore it over plain
  // HTTP, so it's safe to send everywhere; it only takes effect on HTTPS.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  }
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  }
}

export default nextConfig
