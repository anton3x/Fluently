import AsyncStorage from "expo-sqlite/kv-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Language } from "@/db/schema";
import { DEFAULT_LANGUAGE, DEFAULT_VOICE } from "@/constants";

type SettingsState = {
  language: Language
  voiceId: string
  hasSeenOnboarding: boolean
  hasHydrated: boolean
  dailyReminderEnabled: boolean
  setSeen: () => void
  setUnSeen: () => void
  setLanguage: (language: Language) => void
  setHasHydrated: (value: boolean) => void
  setVoiceId: (voiceId: string) => void
  setDailyReminderEnabled: (enabled: boolean) => void
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE as Language,
      voiceId: DEFAULT_VOICE,
      hasSeenOnboarding: false,
      hasHydrated: false,
      dailyReminderEnabled: false,
      setLanguage: (language) => set({ language }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setSeen: () => set({ hasSeenOnboarding: true }),
      setUnSeen: () => set({ hasSeenOnboarding: false }),
      setVoiceId: (voiceId: string) => set({ voiceId }),
      setDailyReminderEnabled: (enabled: boolean) => set({ dailyReminderEnabled: enabled }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        language: state.language,
        hasSeenOnboarding: state.hasSeenOnboarding,
        voiceId: state.voiceId,
        dailyReminderEnabled: state.dailyReminderEnabled,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          state?.setHasHydrated(true)
        }
      },
    }
  )
);
