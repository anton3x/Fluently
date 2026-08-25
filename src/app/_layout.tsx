import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import SplashScreenController from "@/components/splash-screen-controller";

import { I18nController } from "@/components/i18n-controller";
import "@/i18n";
import "../global.css";
import { Platform } from "react-native";
import { useSettingsStore } from "@/stores/settings";

import Providers from "./providers";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

SplashScreen.preventAutoHideAsync();

export function RootNavigator() {
  const hasSeenOnboarding = useSettingsStore((state) => state.hasSeenOnboarding);
  const hasHydratedOnboarding = useSettingsStore((state) => state.hasHydrated);

  if (!hasHydratedOnboarding) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!hasSeenOnboarding}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>

      <Stack.Protected guard={hasSeenOnboarding}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>

      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Providers>
      <I18nController />
      <SplashScreenController />
      <RootNavigator />
      <StatusBar style="auto" />
    </Providers>
  );
}