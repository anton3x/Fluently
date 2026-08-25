import { useRouter } from "expo-router";
import { Button, Typography } from "heroui-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function QuestionEmptyState() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <View
      className="flex-1 items-center justify-center gap-4 bg-background px-6"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Typography.Heading type="h2">{t("practice.completeTitle")}</Typography.Heading>
      <Typography className="text-center" color="muted">
        {t("practice.completeDescription")}
      </Typography>
      <Button onPress={() => router.navigate("/")}>{t("practice.backToLearn")}</Button>
    </View>
  );
}
