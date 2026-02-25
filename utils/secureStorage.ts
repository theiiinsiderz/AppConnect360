/**
 * secureStorage.ts
 *
 * A Zustand-compatible StateStorage adapter backed by expo-secure-store.
 * Provides AES-256 encrypted key–value storage via the platform keychain
 * (iOS Keychain Services / Android Keystore).
 *
 * Compatible with Zustand's `createJSONStorage()` — just pass `secureStorage`
 * as the factory argument.
 */

import * as SecureStore from 'expo-secure-store';
import { StateStorage } from 'zustand/middleware';

export const secureStorage: StateStorage = {
    getItem: async (key: string): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(key);
        } catch {
            return null;
        }
    },

    setItem: async (key: string, value: string): Promise<void> => {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            console.warn(`[SecureStorage] Failed to set "${key}":`, error);
        }
    },

    removeItem: async (key: string): Promise<void> => {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch {
            // Key may not exist — silently ignore
        }
    },
};
