/**
 * CarCard API Configuration
 *
 * Centralized API base URL and endpoint management.
 *
 * HOW TO USE:
 * 1. For local development with backend on same machine:
 *    - Set BACKEND_HOST to your machine's local IP (e.g. '192.168.1.5')
 *    - Run backend with: cd backend && npm run dev
 *
 * 2. For ngrok tunnel:
 *    - Run: ngrok http 5000
 *    - Copy the forwarding URL and set BACKEND_HOST below
 *    - e.g. BACKEND_HOST = 'your-tunnel-id.ngrok-free.dev'
 *    - Set USE_HTTPS = true
 *
 * 3. For production:
 *    - Set BACKEND_HOST to your production domain
 */

// ─────────────────────────────────────────────────────────────
// ▸ STEP 1: CHOOSE YOUR CONNECTION MODE
// ─────────────────────────────────────────────────────────────

/**
 * 1. LOCAL WIFI MODE (Default)
 * Uses your computer's name. Stays the same as long as you're on this Wi-Fi.
 */
const LOCAL_HOSTNAME = '192.168.6.237'; // Your current machine IP

/**
 * 2. ANYWHERE MODE (Cloudflare / ngrok)
 * Use this for cellular data or if Wi-Fi causes issues.
 * 
 * For Cloudflare (Recommended):
 * - Run: 'npm run cf-tunnel' in backend
 * 
 * For ngrok:
 * - Run: 'npm run tunnel' in backend
 * 
 * Then paste the resulting URL below (without https://)
 */
const PUBLIC_URL = 'carcard.onrender.com';

// ─────────────────────────────────────────────────────────────
// ▸ STEP 2: TOGGLE CONFIG HERE
// ─────────────────────────────────────────────────────────────

const USE_PUBLIC_URL = false; // Set to false to use local backend

const BACKEND_HOST = USE_PUBLIC_URL ? PUBLIC_URL : LOCAL_HOSTNAME;
const BACKEND_PORT = USE_PUBLIC_URL ? 443 : 5000;
const USE_HTTPS = USE_PUBLIC_URL; // Public tunnels use HTTPS

// ─────────────────────────────────────────────────────────────

const protocol = USE_HTTPS ? 'https' : 'http';
const portSuffix = (USE_HTTPS || !BACKEND_PORT) ? '' : `:${BACKEND_PORT}`;

export const API_BASE_URL = `${protocol}://${BACKEND_HOST}${portSuffix}/api`;

/**
 * Centralized API endpoint paths.
 * All stores should reference these instead of hardcoding strings.
 */
export const ENDPOINTS = {
    // Auth
    AUTH_SEND_OTP: '/auth/send-otp',
    AUTH_VERIFY_OTP: '/auth/verify-otp',

    // Tags
    TAGS: '/tags',
    TAGS_ACTIVATE: '/tags/activate',
    TAGS_ACTIVATE_SEND_OTP: '/tags/activate/send-otp',
    TAGS_ACTIVATE_VERIFY_OTP: '/tags/activate/verify-otp',
    TAGS_PUBLIC: (id: string) => `/v1/scan/${id}`,
    TAGS_UPDATE: (id: string) => `/tags/${id}`,
    TAGS_PRIVACY: (id: string) => `/tags/${id}/privacy`,
    TAGS_OTP_SEND: (id: string) => `/tags/${id}/otp/send`,
    TAGS_OTP_VERIFY: (id: string) => `/tags/${id}/otp/verify`,

    // Shop
    SHOP_PRODUCTS: '/shop/products',
    SHOP_ORDERS: '/shop/orders',

    // Admin
    ADMIN_TAGS: '/admin/tags/generate',
} as const;
