import { create } from 'zustand';
import api from '../services/api';
import { ENDPOINTS } from '../services/config';

export interface Tag {
    _id: string;
    id?: string;
    code: string;
    nickname: string;
    domainType: 'CAR' | 'KID' | 'PET';
    plateNumber?: string;
    config?: {
        plateNumber?: string;
        displayName?: string;
        petName?: string;
        [key: string]: any;
    };
    isActive: boolean;
    userId?: string;
    status?: 'MINTED' | 'UNCLAIMED' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
    privacy: {
        allowMaskedCall: boolean;
        allowWhatsapp: boolean;
        allowSms: boolean;
        showEmergencyContact: boolean;
    };
    emergencyContact?: {
        name?: string;
        phone?: string;
    };
    scans: {
        timestamp: string;
        location: string;
    }[];
}

interface TagState {
    tags: Tag[];
    isLoading: boolean;
    error: string | null;

    fetchTags: () => Promise<void>;
    registerTag: (code: string, nickname: string, domainType: Tag['domainType'], plateNumber: string) => Promise<boolean>;
    activateTag: (code: string, nickname: string, domainType: Tag['domainType'], plateNumber: string) => Promise<boolean>;
    activateTagSendOtp: (code: string, phoneNumber: string) => Promise<boolean>;
    activateTagVerifyOtp: (code: string, phoneNumber: string, otp: string, plateNumber: string) => Promise<{ success: boolean; user?: any; token?: string }>;
    togglePrivacy: (tagId: string, setting: keyof Tag['privacy']) => Promise<void>;
    getPublicTag: (tagId: string) => Promise<any>;
    updateTag: (tagId: string, data: Partial<Tag> & Record<string, any>) => Promise<{ success: boolean; otpRequired?: boolean }>;
    sendTagOtp: (tagId: string, phoneNumber: string, pendingData: any) => Promise<boolean>;
    verifyTagOtpAndUpdate: (tagId: string, phoneNumber: string, otp: string, pendingData: any) => Promise<boolean>;
}

export const useTagStore = create<TagState>((set, get) => ({
    tags: [],
    isLoading: false,
    error: null,

    fetchTags: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(ENDPOINTS.TAGS);
            set({ tags: response.data || [], isLoading: false });
        } catch (error: any) {
            const status = error.response?.status;
            if (status === 401) {
                // Not logged in — this is expected, not an error
                set({ tags: [], isLoading: false, error: null });
            } else {
                set({ tags: [], isLoading: false, error: 'Failed to load tags' });
            }
        }
    },

    registerTag: async (code, nickname, domainType, plateNumber) => {
        set({ isLoading: true });
        try {
            const response = await api.post(ENDPOINTS.TAGS, { code, nickname, domainType, plateNumber });
            set(state => ({ tags: [...state.tags, response.data], isLoading: false }));
            return true;
        } catch (error) {
            set({ isLoading: false, error: 'Failed to register tag' });
            return false;
        }
    },

    activateTag: async (code, nickname, domainType, plateNumber) => {
        set({ isLoading: true });
        try {
            const response = await api.post(ENDPOINTS.TAGS_ACTIVATE, { code, nickname, domainType, plateNumber });
            set(state => ({ tags: [...state.tags, response.data.tag], isLoading: false }));
            return true;
        } catch (error) {
            set({ isLoading: false });
            return false;
        }
    },

    activateTagSendOtp: async (code, phoneNumber) => {
        set({ isLoading: true, error: null });
        try {
            await api.post(ENDPOINTS.TAGS_ACTIVATE_SEND_OTP, { code, phoneNumber });
            set({ isLoading: false });
            return true;
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || 'Failed to send OTP' });
            return false;
        }
    },

    activateTagVerifyOtp: async (code, phoneNumber, otp, plateNumber) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(ENDPOINTS.TAGS_ACTIVATE_VERIFY_OTP, { code, phoneNumber, otp, plateNumber });
            const { token, user, tag } = response.data;
            set(state => ({
                tags: [...state.tags, tag],
                isLoading: false,
            }));
            return { success: true, user, token };
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || 'Activation failed' });
            return { success: false };
        }
    },

    togglePrivacy: async (tagId, setting) => {
        set(state => ({
            tags: state.tags.map(tag => {
                if (tag._id === tagId || tag.id === tagId || tag.code === tagId) {
                    const privacy = tag.privacy || {
                        allowMaskedCall: false,
                        allowWhatsapp: false,
                        allowSms: false,
                        showEmergencyContact: false,
                    };
                    return { ...tag, privacy: { ...privacy, [setting]: !privacy[setting] } };
                }
                return tag;
            }),
        }));
        try {
            await api.patch(ENDPOINTS.TAGS_PRIVACY(tagId), { setting });
        } catch (error) {
            set(state => ({
                tags: state.tags.map(tag => {
                    if (tag._id === tagId || tag.id === tagId || tag.code === tagId) {
                        const privacy = tag.privacy || {
                            allowMaskedCall: false,
                            allowWhatsapp: false,
                            allowSms: false,
                            showEmergencyContact: false,
                        };
                        return { ...tag, privacy: { ...privacy, [setting]: !privacy[setting] } };
                    }
                    return tag;
                }),
            }));
        }
    },

    getPublicTag: async (tagId: string) => {
        try {
            const response = await api.get(ENDPOINTS.TAGS_PUBLIC(tagId));
            return response.data;
        } catch (error: any) {
            if (__DEV__) {
                console.log('🔍 getPublicTag error for', tagId, ':', error.response?.status, error.response?.data);
            }
            // If backend says tag is locked (blank tag scanned from browser),
            // return the locked response data so the UI can handle it
            if (error.response?.status === 403 && error.response?.data?.locked) {
                return error.response.data;
            }
            return null;
        }
    },

    updateTag: async (tagId, data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(ENDPOINTS.TAGS_UPDATE(tagId), data);
            if (response.data.otpRequired) {
                set({ isLoading: false });
                return { success: false, otpRequired: true };
            }
            set(state => ({
                tags: state.tags.map(t => (t._id === tagId ? response.data.tag : t)),
                isLoading: false,
            }));
            return { success: true };
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || 'Failed to update tag' });
            return { success: false };
        }
    },

    sendTagOtp: async (tagId, phoneNumber, pendingData) => {
        try {
            await api.post(ENDPOINTS.TAGS_OTP_SEND(tagId), { phoneNumber, pendingData });
            return true;
        } catch (error) {
            return false;
        }
    },

    verifyTagOtpAndUpdate: async (tagId, phoneNumber, otp, pendingData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(ENDPOINTS.TAGS_OTP_VERIFY(tagId), { phoneNumber, otp, pendingData });
            set(state => ({
                tags: state.tags.map(t => (t._id === tagId ? response.data.tag : t)),
                isLoading: false,
            }));
            return true;
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || 'OTP verification failed' });
            return false;
        }
    },
}));
