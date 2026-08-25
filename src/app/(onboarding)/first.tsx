import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Button, Typography } from "heroui-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View
      className="flex-1 bg-background px-6"
      style={{ paddingTop: 12, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 justify-between">
        <View className="gap-5">
          <Image
            source={require("../../../assets/images/icon.png")}
            contentFit="cover"
            style={{ width: 64, height: 64, borderRadius: 20 }}
            accessibilityLabel={t("accessibility.fluentlyLogo")}
          />

          <View className="gap-2">
            <Typography.Heading type="h1">{t("onboarding.welcome.title")}</Typography.Heading>
            <Typography color="muted">{t("onboarding.welcome.description")}</Typography>
          </View>
        </View>

        <Button size="lg" className="w-full" onPress={() => router.push("/(onboarding)/secound")}>
          {t("onboarding.welcome.action")}
        </Button>
      </View>
    </View>
  );
}
