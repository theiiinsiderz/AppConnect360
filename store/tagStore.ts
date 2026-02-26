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

    fetchTags: (options?: { force?: boolean }) => Promise<void>;
    registerTag: (code: string, nickname: string, domainType: Tag['domainType'], plateNumber: string) => Promise<boolean>;
    activateTag: (code: string, nickname: string, domainType: Tag['domainType'], plateNumber: string) => Promise<boolean>;
    activateTagSendOtp: (code: string, phoneNumber: string) => Promise<boolean>;
    activateTagVerifyOtp: (code: string, phoneNumber: string, otp: string, plateNumber: string) => Promise<{ success: boolean; user?: any; token?: string }>;
    togglePrivacy: (tagId: string, setting: keyof Tag['privacy']) => Promise<void>;
    getPublicTag: (tagId: string) => Promise<any>;
    updateTag: (tagId: string, data: Partial<Tag> & Record<string, any>) => Promise<{ success: boolean; otpRequired?: boolean; unsupported?: boolean }>;
    sendTagOtp: (tagId: string, phoneNumber: string, pendingData: any) => Promise<boolean>;
    verifyTagOtpAndUpdate: (tagId: string, phoneNumber: string, otp: string, pendingData: any) => Promise<boolean>;
}

const TAG_CACHE_TTL_MS = 30_000;
let fetchTagsPromise: Promise<void> | null = null;
let tagsLastFetchedAt = 0;

let activateTagEndpointSupported = true;
let updateTagEndpointSupported = true;
let sendTagOtpEndpointSupported = true;
let verifyTagOtpEndpointSupported = true;

const EMPTY_PRIVACY = {
    allowMaskedCall: false,
    allowWhatsapp: false,
    allowSms: false,
    showEmergencyContact: false,
};

const normalizeDomainType = (domainType: any): Tag['domainType'] => {
    if (domainType === 'KID' || domainType === 'PET' || domainType === 'CAR') {
        return domainType;
    }
    return 'CAR';
};

const normalizeTag = (raw: any): Tag => {
    const domainType = normalizeDomainType(raw?.domainType);
    const id = raw?._id || raw?.id || raw?.code || '';
    const privacy = {
        allowMaskedCall: raw?.privacy?.allowMaskedCall ?? !!raw?.allowMaskedCall,
        allowWhatsapp: raw?.privacy?.allowWhatsapp ?? !!raw?.allowWhatsapp,
        allowSms: raw?.privacy?.allowSms ?? !!raw?.allowSms,
        showEmergencyContact: raw?.privacy?.showEmergencyContact ?? !!raw?.showEmergencyContact,
    };

    const fallbackConfig =
        raw?.config ||
        (domainType === 'CAR' ? raw?.carProfile : domainType === 'KID' ? raw?.kidProfile : raw?.petProfile) ||
        {};

    const normalizedConfig = {
        ...fallbackConfig,
        plateNumber: fallbackConfig?.plateNumber || fallbackConfig?.vehicleNumber || raw?.plateNumber,
        displayName: fallbackConfig?.displayName,
        petName: fallbackConfig?.petName,
    };

    return {
        ...raw,
        _id: id,
        id: raw?.id || id,
        domainType,
        config: normalizedConfig,
        isActive: typeof raw?.isActive === 'boolean' ? raw.isActive : raw?.status === 'ACTIVE',
        status: raw?.status,
        privacy,
        scans: Array.isArray(raw?.scans) ? raw.scans : [],
    };
};

const normalizeTags = (rows: any): Tag[] => (Array.isArray(rows) ? rows.map(normalizeTag) : []);

const mergeTag = (tags: Tag[], nextTag: Tag): Tag[] => {
    const incomingId = nextTag._id || nextTag.id || nextTag.code;
    const existingIndex = tags.findIndex((tag) => {
        const currentId = tag._id || tag.id || tag.code;
        return currentId === incomingId || tag.code === nextTag.code;
    });

    if (existingIndex === -1) {
        return [...tags, nextTag];
    }

    const copy = [...tags];
    copy[existingIndex] = nextTag;
    return copy;
};

const getErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    fallback;

export const useTagStore = create<TagState>((set, get) => ({
    tags: [],
    isLoading: false,
    error: null,

    fetchTags: async ({ force = false } = {}) => {
        const now = Date.now();
        const hasFreshCache = now - tagsLastFetchedAt < TAG_CACHE_TTL_MS;

        if (!force && fetchTagsPromise) {
            return fetchTagsPromise;
        }

        if (!force && hasFreshCache && get().tags.length > 0) {
            return;
        }

        set({ isLoading: true, error: null });

        fetchTagsPromise = (async () => {
            try {
                const response = await api.get(ENDPOINTS.TAGS);
                const tags = normalizeTags(response.data);
                tagsLastFetchedAt = Date.now();
                set({ tags, isLoading: false, error: null });
            } catch (error: any) {
                const status = error.response?.status;
                if (status === 401) {
                    tagsLastFetchedAt = Date.now();
                    set({ tags: [], isLoading: false, error: null });
                } else {
                    set({ tags: [], isLoading: false, error: getErrorMessage(error, 'Failed to load tags') });
                }
            } finally {
                fetchTagsPromise = null;
            }
        })();

        return fetchTagsPromise;
    },

    registerTag: async (code, nickname, domainType, plateNumber) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(ENDPOINTS.TAGS, { code, nickname, domainType, plateNumber });
            const createdTag = normalizeTag(response.data);
            tagsLastFetchedAt = Date.now();
            set((state) => ({ tags: mergeTag(state.tags, createdTag), isLoading: false, error: null }));
            return true;
        } catch (error: any) {
            set({ isLoading: false, error: getErrorMessage(error, 'Failed to register tag') });
            return false;
        }
    },

    activateTag: async (code, nickname, domainType, plateNumber) => {
        if (!activateTagEndpointSupported) {
            return false;
        }

        set({ isLoading: true, error: null });
        try {
            const response = await api.post(ENDPOINTS.TAGS_ACTIVATE, { code, nickname, domainType, plateNumber });
            const activatedTag = normalizeTag(response.data?.tag || response.data);
            tagsLastFetchedAt = Date.now();
            set((state) => ({ tags: mergeTag(state.tags, activatedTag), isLoading: false, error: null }));
            return true;
        } catch (error: any) {
            const message = getErrorMessage(error, 'Activation failed');
            if (message.includes('Not Implemented in V2 API')) {
                activateTagEndpointSupported = false;
            }
            set({ isLoading: false, error: message });
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
            set({ isLoading: false, error: getErrorMessage(error, 'Failed to send OTP') });
            return false;
        }
    },

    activateTagVerifyOtp: async (code, phoneNumber, otp, plateNumber) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(ENDPOINTS.TAGS_ACTIVATE_VERIFY_OTP, { code, phoneNumber, otp, plateNumber });
            const { token, user, tag } = response.data;
            const normalizedTag = normalizeTag(tag);
            tagsLastFetchedAt = Date.now();
            set((state) => ({
                tags: mergeTag(state.tags, normalizedTag),
                isLoading: false,
                error: null,
            }));
            return { success: true, user, token };
        } catch (error: any) {
            set({ isLoading: false, error: getErrorMessage(error, 'Activation failed') });
            return { success: false };
        }
    },

    togglePrivacy: async (tagId, setting) => {
        const toggleLocalPrivacy = () => {
            set((state) => ({
                tags: state.tags.map((tag) => {
                    if (tag._id === tagId || tag.id === tagId || tag.code === tagId) {
                        const privacy = tag.privacy || EMPTY_PRIVACY;
                        return { ...tag, privacy: { ...privacy, [setting]: !privacy[setting] } };
                    }
                    return tag;
                }),
            }));
        };

        toggleLocalPrivacy();

        try {
            await api.patch(ENDPOINTS.TAGS_PRIVACY(tagId), { setting });
        } catch {
            toggleLocalPrivacy();
        }
    },

    getPublicTag: async (tagId: string) => {
        try {
            const response = await api.get(ENDPOINTS.TAGS_PUBLIC(tagId));
            return response.data;
        } catch (error: any) {
            if (__DEV__) {
                console.log('getPublicTag error for', tagId, ':', error.response?.status, error.response?.data);
            }
            if (error.response?.status === 403 && error.response?.data?.locked) {
                return error.response.data;
            }
            return null;
        }
    },

    updateTag: async (tagId, data) => {
        if (!updateTagEndpointSupported) {
            const message = 'Tag update endpoint is currently unavailable.';
            set({ error: message });
            return { success: false, unsupported: true };
        }

        set({ isLoading: true, error: null });
        try {
            const response = await api.put(ENDPOINTS.TAGS_UPDATE(tagId), data);
            if (response.data.otpRequired) {
                set({ isLoading: false });
                return { success: false, otpRequired: true };
            }

            const normalizedTag = normalizeTag(response.data?.tag || response.data);
            tagsLastFetchedAt = Date.now();
            set((state) => ({
                tags: state.tags.map((t) => {
                    if (t._id === tagId || t.id === tagId || t.code === tagId) {
                        return normalizedTag;
                    }
                    return t;
                }),
                isLoading: false,
                error: null,
            }));
            return { success: true };
        } catch (error: any) {
            const message = getErrorMessage(error, 'Failed to update tag');
            if (message.includes('Migrated to /v1/tags/:id/configuration')) {
                updateTagEndpointSupported = false;
                set({
                    isLoading: false,
                    error: 'Tag edit is temporarily unavailable while backend migration is in progress.',
                });
                return { success: false, unsupported: true };
            }
            set({ isLoading: false, error: message });
            return { success: false };
        }
    },

    sendTagOtp: async (tagId, phoneNumber, pendingData) => {
        if (!sendTagOtpEndpointSupported) {
            set({ error: 'Tag OTP verification endpoint is currently unavailable.' });
            return false;
        }

        try {
            await api.post(ENDPOINTS.TAGS_OTP_SEND(tagId), { phoneNumber, pendingData });
            return true;
        } catch (error: any) {
            const message = getErrorMessage(error, 'Failed to send OTP');
            if (message.includes('Not Implemented in V2 API')) {
                sendTagOtpEndpointSupported = false;
                set({ error: 'Tag OTP verification is temporarily unavailable.' });
                return false;
            }
            set({ error: message });
            return false;
        }
    },

    verifyTagOtpAndUpdate: async (tagId, phoneNumber, otp, pendingData) => {
        if (!verifyTagOtpEndpointSupported) {
            set({ error: 'Tag OTP verification endpoint is currently unavailable.' });
            return false;
        }

        set({ isLoading: true, error: null });
        try {
            const response = await api.post(ENDPOINTS.TAGS_OTP_VERIFY(tagId), { phoneNumber, otp, pendingData });
            const normalizedTag = normalizeTag(response.data?.tag || response.data);
            tagsLastFetchedAt = Date.now();
            set((state) => ({
                tags: state.tags.map((t) => {
                    if (t._id === tagId || t.id === tagId || t.code === tagId) {
                        return normalizedTag;
                    }
                    return t;
                }),
                isLoading: false,
                error: null,
            }));
            return true;
        } catch (error: any) {
            const message = getErrorMessage(error, 'OTP verification failed');
            if (message.includes('Not Implemented in V2 API')) {
                verifyTagOtpEndpointSupported = false;
                set({ isLoading: false, error: 'Tag OTP verification is temporarily unavailable.' });
                return false;
            }
            set({ isLoading: false, error: message });
            return false;
        }
    },
}));
