import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import api from '../services/api';
import { ENDPOINTS } from '../services/config';
import { secureStorage } from '../utils/secureStorage';

interface User {
    id?: string;
    _id?: string;
    phoneNumber: string;
    name?: string;
    email?: string;
    avatar?: string;
    token?: string;
    role?: 'user' | 'admin' | 'USER' | 'ADMIN';
}

const normalizeRole = (role: unknown): User['role'] => {
    if (role === 'admin' || role === 'ADMIN') return 'admin';
    if (role === 'user' || role === 'USER') return 'user';
    return undefined;
};

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    hasAcceptedPrivacyPolicy: boolean;

    authenticate: (phoneNumber: string) => Promise<boolean>;
    logout: () => void;
    setUser: (user: User) => void;
    setPrivacyConsent: (accepted: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,
            isAuthenticated: false,
            hasAcceptedPrivacyPolicy: false,

            authenticate: async (phoneNumber) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post(ENDPOINTS.AUTH_AUTHENTICATE, { phoneNumber });
                    const { user, token } = response.data;
                    const normalizedUser = {
                        ...user,
                        role: normalizeRole(user?.role),
                    };

                    set({
                        user: normalizedUser,
                        token,
                        isAuthenticated: true,
                        isLoading: false
                    });

                    return true;
                } catch (error: any) {
                    set({ isLoading: false, error: error.response?.data?.message || 'Authentication failed' });
                    return false;
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    hasAcceptedPrivacyPolicy: false,
                });
            },

            setUser: (user) => set({
                user: {
                    ...user,
                    role: normalizeRole(user?.role),
                }
            }),

            setPrivacyConsent: (accepted) => set({
                hasAcceptedPrivacyPolicy: accepted,
            }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => secureStorage),
        }
    )
);
