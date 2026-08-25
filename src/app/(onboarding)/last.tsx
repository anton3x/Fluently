import { useRouter } from "expo-router";
import { Button, Typography } from "heroui-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { useSettingsStore } from "@/stores/settings";

export default function ReadyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const language = useSettingsStore((state) => state.language);
  const setSeenOnboarding = useSettingsStore((state) => state.setSeen);
  const { t } = useTranslation();

  return (
    <View
      className="flex-1 bg-background px-6"
      style={{ paddingTop: 12, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 justify-between">
        <View className="gap-3">
          <Typography.Heading type="h1">{t("onboarding.ready.title")}</Typography.Heading>
          <Typography color="muted">{t("onboarding.ready.description")}</Typography>
        </View>

        <Button
          size="lg"
          className="w-full"
          isDisabled={!language}
          onPress={() => {
            setSeenOnboarding();
            router.replace("/(main)");
          }}
        >
          {t("onboarding.ready.action")}
        </Button>
      </View>
    </View>
  );
}
