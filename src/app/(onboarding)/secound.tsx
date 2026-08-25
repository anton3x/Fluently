import { useRouter } from "expo-router";
import { Button, Label, Radio, RadioGroup, Typography } from "heroui-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { languages, type Language } from "@/db/schema";
import { useSettingsStore } from "@/stores/settings";

export default function LanguageScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const { t } = useTranslation();
  const languageOptions = languages.map((value) => ({ value, label: t(`languages.${value}`) }));

  return (
    <View
      className="flex-1 bg-background px-6"
      style={{ paddingTop: 12, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 justify-between gap-8">
        <View className="gap-2">
          <Typography.Heading type="h1">{t("onboarding.language.title")}</Typography.Heading>
          <Typography color="muted">{t("onboarding.language.description")}</Typography>
        </View>

        <RadioGroup value={language} onValueChange={(value) => setLanguage(value as Language)}>
          {languageOptions.map((option) => (
            <RadioGroup.Item
              key={option.value}
              value={option.value}
              className="mb-3 flex-row items-center justify-between border border-border bg-surface px-5 py-4"
            >
              <Label className="text-base font-semibold text-foreground">{option.label}</Label>
              <Radio />
            </RadioGroup.Item>
          ))}
        </RadioGroup>

        <Button
          size="lg"
          className="w-full"
          isDisabled={!language}
          onPress={() => router.push("/(onboarding)/last")}
        >
          {t("onboarding.language.action")}
        </Button>
      </View>
    </View>
  );
}
