import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useThemeColor } from "heroui-native";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const [accent] = useThemeColor(["accent"]);
  const { t } = useTranslation();
  return (
    <NativeTabs tintColor={accent}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="book.fill" md="menu_book" />
        <NativeTabs.Trigger.Label>{t("tabs.learn")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf="gear.circle" md="settings" />
        <NativeTabs.Trigger.Label>{t("tabs.settings")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
