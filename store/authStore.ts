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
    termsAccepted?: boolean;
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

    authenticate: (phoneNumber: string, termsAccepted?: boolean) => Promise<boolean>;
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

            authenticate: async (phoneNumber, termsAccepted) => {
                set({ isLoading: true, error: null });
                try {
                    const resolvedTermsAccepted =
                        typeof termsAccepted === 'boolean'
                            ? termsAccepted
                            : get().hasAcceptedPrivacyPolicy;

                    const payload: Record<string, any> = { phoneNumber };
                    if (resolvedTermsAccepted) {
                        payload.termsAccepted = true;
                    }

                    const response = await api.post(ENDPOINTS.AUTH_AUTHENTICATE, payload);
                    const { user, token } = response.data;
                    const normalizedUser = {
                        ...user,
                        role: normalizeRole(user?.role),
                    };

                    set({
                        user: normalizedUser,
                        token,
                        isAuthenticated: true,
                        hasAcceptedPrivacyPolicy:
                            normalizedUser?.termsAccepted === true || resolvedTermsAccepted,
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
                },
                hasAcceptedPrivacyPolicy: user?.termsAccepted === true || get().hasAcceptedPrivacyPolicy,
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
