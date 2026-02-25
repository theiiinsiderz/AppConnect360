// Set this to your computer's local Wi-Fi IP address so Expo Go on your phone can connect!
// e.g., 'http://10.169.138.121:5000/api'
export const API_BASE_URL = 'https://carcard.onrender.com/api';

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
