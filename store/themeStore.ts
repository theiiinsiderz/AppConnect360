import { Appearance, ColorSchemeName } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { secureStorage } from '../utils/secureStorage';

interface ThemeState {
    mode: ColorSchemeName;
    setMode: (mode: ColorSchemeName) => void;
    toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            mode: Appearance.getColorScheme() || 'dark', // Default to dark per request
            setMode: (mode) => set({ mode }),
            toggleMode: () => set((state) => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => secureStorage),
        }
    )
);
