import { Typography } from "heroui-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function QuestionLoadingState() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View
      className="flex-1 items-center justify-center gap-2 bg-background px-6"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Typography.Heading type="h2">{t("practice.loadingTitle")}</Typography.Heading>
      <Typography color="muted">{t("practice.loadingDescription")}</Typography>
    </View>
  );
}
