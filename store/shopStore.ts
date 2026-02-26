import { create } from 'zustand';
import api from '../services/api';
import { ENDPOINTS } from '../services/config';

export interface Product {
    _id: string;
    id?: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: 'car' | 'bike' | 'business' | 'bundle';
    features: string[];
    stock: number;
    isActive: boolean;
}

interface ShopState {
    products: Product[];
    cart: { product: Product; quantity: number }[];
    isLoading: boolean;
    error: string | null;

    fetchProducts: (options?: { force?: boolean }) => Promise<void>;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    checkout: () => Promise<boolean>;
}

const SHOP_CACHE_TTL_MS = 60_000;
let fetchProductsPromise: Promise<void> | null = null;
let productsLastFetchedAt = 0;

const normalizeProduct = (raw: any): Product => {
    const id = raw?._id || raw?.id || '';

    return {
        ...raw,
        _id: id,
        id: raw?.id || id,
    };
};

const normalizeProducts = (rows: any): Product[] => (Array.isArray(rows) ? rows.map(normalizeProduct) : []);

const getProductId = (product: Product) => product._id || product.id || '';

export const useShopStore = create<ShopState>((set, get) => ({
    products: [],
    cart: [],
    isLoading: false,
    error: null,

    fetchProducts: async ({ force = false } = {}) => {
        const now = Date.now();
        const hasFreshCache = now - productsLastFetchedAt < SHOP_CACHE_TTL_MS;

        if (!force && fetchProductsPromise) {
            return fetchProductsPromise;
        }

        if (!force && hasFreshCache && get().products.length > 0) {
            return;
        }

        set({ isLoading: true, error: null });

        fetchProductsPromise = (async () => {
            try {
                const response = await api.get(ENDPOINTS.SHOP_PRODUCTS);
                const products = normalizeProducts(response.data);
                productsLastFetchedAt = Date.now();
                set({ products, isLoading: false, error: null });
            } catch (error: any) {
                const status = error.response?.status;
                const isNetworkError = !error.response;
                set({
                    isLoading: false,
                    error: isNetworkError
                        ? 'Cannot reach server. Check your connection.'
                        : `Failed to load products (${status})`,
                });
            } finally {
                fetchProductsPromise = null;
            }
        })();

        return fetchProductsPromise;
    },

    addToCart: (product) => {
        set((state) => {
            const incomingProductId = getProductId(product);
            const existing = state.cart.find((item) => getProductId(item.product) === incomingProductId);

            if (existing) {
                return {
                    cart: state.cart.map((item) =>
                        getProductId(item.product) === incomingProductId
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    ),
                };
            }

            return { cart: [...state.cart, { product: normalizeProduct(product), quantity: 1 }] };
        });
    },

    removeFromCart: (productId) => {
        set((state) => ({
            cart: state.cart.filter((item) => getProductId(item.product) !== productId),
        }));
    },

    clearCart: () => set({ cart: [] }),

    checkout: async () => {
        set({ isLoading: true, error: null });
        try {
            const state = get();
            const items = state.cart.map((item) => ({
                productId: getProductId(item.product),
                quantity: item.quantity,
            }));
            const totalAmount = state.cart.reduce(
                (sum, item) => sum + item.product.price * item.quantity,
                0
            );

            await api.post(ENDPOINTS.SHOP_ORDERS, { items, totalAmount });
            set({ cart: [], isLoading: false, error: null });
            return true;
        } catch {
            set({ isLoading: false, error: 'Checkout failed' });
            return false;
        }
    },
}));
