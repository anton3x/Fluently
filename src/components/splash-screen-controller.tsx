import { useSettingsStore } from "@/stores/settings";
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'

export default function SplashScreenController() {
  const hasHydratedOnboarding = useSettingsStore((state) => state.hasHydrated)

  useEffect(() => {
    if (hasHydratedOnboarding) SplashScreen.hide()
  }, [hasHydratedOnboarding])

  return null
}