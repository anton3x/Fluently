import { useSettingsStore } from "@/stores/settings";
import { languages, type Language } from "@/db/schema";
import {
  Accordion,
  BottomSheet,
  LinkButton,
  ListGroup,
  ScrollShadow,
  Select,
  Separator,
  Switch,
  useThemeColor,
  useToast,
} from "heroui-native";
import { Text, ScrollView, View } from "react-native";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { withUniwind } from "uniwind";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useVoices } from "@/features/questions/hooks/use-voices";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { dailyReminderService } from "@/features/notifications/services/daily-reminder-service";
import QuestionUpload from "@/features/questions/components/question-upload";
import { Linking } from "react-native";

const StyledIonicons = withUniwind(Ionicons);

export default function SettingsTab() {
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const setUnSeenOnboarding = useSettingsStore((state) => state.setUnSeen);

  const mutedColor = useThemeColor("muted");
  const { t } = useTranslation();
  const { toast } = useToast();
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const languageOptions = languages.map((value) => ({ value, label: t(`languages.${value}`) }));
  const selectedLanguage = languageOptions.find((option) => option.value === language);
  const voiceId = useSettingsStore((state) => state.voiceId);
  const setVoiceId = useSettingsStore((state) => state.setVoiceId);

  const { voices, loadVoices, isLoading } = useVoices();

  const isDailyReminderEnabled = useSettingsStore((state) => state.dailyReminderEnabled);
  const setDailyReminderEnabled = useSettingsStore((state) => state.setDailyReminderEnabled);
  const [isSavingDailyReminder, setIsSavingDailyReminder] = useState(false);

  const voiceOptions = voices.map((voice) => ({
    value: voice.identifier,
    label: voice.name,
  }));

  const insets = useSafeAreaInsets();

  async function setDailyReminder(isEnabled: boolean) {
    setIsSavingDailyReminder(true);

    try {
      if (!isEnabled) {
        await dailyReminderService.disable();
        setDailyReminderEnabled(false);
        return;
      }

      const isGranted = await dailyReminderService.enable(
        t("settings.notifications.reminderTitle"),
        t("settings.notifications.reminderBody"),
        t("settings.notifications.channelName")
      );

      if (isGranted) {
        setDailyReminderEnabled(true);
        return;
      }

      setDailyReminderEnabled(await dailyReminderService.isEnabled());
      toast.show({
        description: t("settings.notifications.permissionDeniedDescription"),
        label: t("settings.notifications.permissionDeniedTitle"),
        variant: "default",
      });
    } catch {
      toast.show({
        description: t("settings.notifications.scheduleErrorDescription"),
        label: t("settings.notifications.scheduleErrorTitle"),
        variant: "default",
      });
    } finally {
      setIsSavingDailyReminder(false);
    }
  }

  return (
    <ScrollView className="flex-1 px-5 bg-background" style={{ paddingTop: insets.top }}>
      <Text className="text-sm text-muted mb-2 ml-2">{t("settings.general")}</Text>
      <ListGroup className="mb-6">
        <BottomSheet>
          <BottomSheet.Trigger asChild>
            <ListGroup.Item>
              <ListGroup.ItemPrefix>
                <StyledIonicons
                  name="notifications-outline"
                  size={22}
                  className="text-foreground"
                />
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>{t("settings.notifications.title")}</ListGroup.ItemTitle>
                <ListGroup.ItemDescription>
                  {isDailyReminderEnabled
                    ? t("settings.notifications.dailyTime")
                    : t("settings.notifications.description")}
                </ListGroup.ItemDescription>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix />
            </ListGroup.Item>
          </BottomSheet.Trigger>

          <BottomSheet.Portal>
            <BottomSheet.Overlay />
            <BottomSheet.Content snapPoints={["40%"]}>
              <View className="mt-8 flex-row items-center justify-between gap-4">
                <View className="flex-1 gap-1">
                  <Text className="font-semibold text-foreground">
                    {t("settings.notifications.dailyToggle")}
                  </Text>
                  <Text className="text-sm text-muted">
                    {t("settings.notifications.dailyTime")}
                  </Text>
                </View>
                <Switch
                  isDisabled={isSavingDailyReminder}
                  isSelected={isDailyReminderEnabled}
                  onSelectedChange={(isEnabled) => {
                    void setDailyReminder(isEnabled);
                  }}
                />
              </View>
            </BottomSheet.Content>
          </BottomSheet.Portal>
        </BottomSheet>
        <Separator className="mx-4" />
        <ListGroup.Item
          onPress={() => {
            toast.show({
              variant: "default",
              label: t("settings.devices.comingSoonTitle"),
              description: t("settings.devices.comingSoonDescription"),
              actionLabel: t("common.close"),
              onActionPress: ({ hide }) => hide(),
            });
          }}
        >
          <ListGroup.ItemPrefix>
            <StyledIonicons name="phone-portrait-outline" size={22} className="text-foreground" />
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>{t("settings.devices.title")}</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              {t("settings.devices.description")}
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix />
        </ListGroup.Item>
        <Separator className="mx-4" />
        <Select
          value={voiceOptions.find((option) => option.value === voiceId)}
          onValueChange={(selection) => {
            if (selection) {
              setVoiceId(selection.value);
            }
          }}
          onOpenChange={loadVoices}
          presentation="bottom-sheet"
        >
          <Select.Trigger variant="unstyled" asChild>
            <ListGroup.Item>
              <ListGroup.ItemPrefix>
                <StyledIonicons name="volume-high-outline" size={22} className="text-foreground" />
              </ListGroup.ItemPrefix>

              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>{t("settings.voice.title")}</ListGroup.ItemTitle>

                <ListGroup.ItemDescription>
                  {voiceOptions.find((option) => option.value === voiceId)?.label ??
                    t("settings.voice.selectPlaceholder")}
                </ListGroup.ItemDescription>
              </ListGroup.ItemContent>

              <ListGroup.ItemSuffix />
            </ListGroup.Item>
          </Select.Trigger>

          <Select.Portal>
            <Select.Overlay />

            <Select.Content presentation="bottom-sheet" snapPoints={["65%"]}>
              <Select.ListLabel>{t("settings.voice.listLabel")}</Select.ListLabel>

              {isLoading ? (
                <Select.Item value="loading" label={t("settings.voice.loading")} disabled />
              ) : (
                voiceOptions.map((option) => <Select.Item key={option.value} {...option} />)
              )}
            </Select.Content>
          </Select.Portal>
        </Select>
        <Separator className="mx-4" />
        <Select
          value={selectedLanguage}
          onValueChange={(selection) => {
            if (selection) {
              setLanguage(selection.value as Language);
            }
          }}
          presentation="bottom-sheet"
        >
          <Select.Trigger variant="unstyled" asChild>
            <ListGroup.Item>
              <ListGroup.ItemPrefix>
                <StyledIonicons name="language-outline" size={22} className="text-foreground" />
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>{t("settings.language.title")}</ListGroup.ItemTitle>
                <ListGroup.ItemDescription>{selectedLanguage?.label}</ListGroup.ItemDescription>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix />
            </ListGroup.Item>
          </Select.Trigger>
          <Select.Portal>
            <Select.Overlay />
            <Select.Content presentation="bottom-sheet" snapPoints={["55%"]}>
              <Select.ListLabel>{t("settings.language.label")}</Select.ListLabel>
              {languageOptions.map((option) => (
                <Select.Item key={option.value} {...option} />
              ))}
            </Select.Content>
          </Select.Portal>
        </Select>
        <Separator className="mx-4" />
        <ListGroup.Item onPress={setUnSeenOnboarding}>
          <ListGroup.ItemPrefix>
            <StyledIonicons name="refresh-outline" size={22} className="text-foreground" />
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>{t("settings.reset.title")}</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>{t("settings.reset.description")}</ListGroup.ItemDescription>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix />
        </ListGroup.Item>
        <Separator className="mx-4" />
        <QuestionUpload />
        <Separator className="mx-4" />
      </ListGroup>
      <Text className="text-sm text-muted mb-2 ml-2">{t("settings.support")}</Text>
      <ListGroup>
        <BottomSheet>
          <BottomSheet.Trigger asChild>
            <ListGroup.Item>
              <ListGroup.ItemPrefix>
                <StyledIonicons name="help-circle-outline" size={22} className="text-foreground" />
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>{t("settings.help.title")}</ListGroup.ItemTitle>
                <ListGroup.ItemDescription>
                  {t("settings.help.description")}
                </ListGroup.ItemDescription>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix />
            </ListGroup.Item>
          </BottomSheet.Trigger>
          <BottomSheet.Portal>
            <BottomSheet.Overlay />
            <BottomSheet.Content snapPoints={["65%"]}>
              <View className="mb-6 gap-2">
                <BottomSheet.Title>{t("settings.help.sheetTitle")}</BottomSheet.Title>
                <BottomSheet.Description>
                  {t("settings.help.sheetDescription")}
                </BottomSheet.Description>
              </View>
              <Accordion selectionMode="single" variant="surface">
                <Accordion.Item value="practice">
                  <Accordion.Trigger>
                    <Text className="flex-1 text-base font-semibold text-foreground">
                      {t("settings.help.practiceQuestion")}
                    </Text>
                    <Accordion.Indicator />
                  </Accordion.Trigger>
                  <Accordion.Content>
                    <Text className="px-5 text-muted">{t("settings.help.practiceAnswer")}</Text>
                  </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value="reminders">
                  <Accordion.Trigger>
                    <Text className="flex-1 text-base font-semibold text-foreground">
                      {t("settings.help.reminderQuestion")}
                    </Text>
                    <Accordion.Indicator />
                  </Accordion.Trigger>
                  <Accordion.Content>
                    <Text className="px-5 text-muted">{t("settings.help.reminderAnswer")}</Text>
                  </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value="language">
                  <Accordion.Trigger>
                    <Text className="flex-1 text-base font-semibold text-foreground">
                      {t("settings.help.languageQuestion")}
                    </Text>
                    <Accordion.Indicator />
                  </Accordion.Trigger>
                  <Accordion.Content>
                    <Text className="px-5 text-muted">{t("settings.help.languageAnswer")}</Text>
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion>
            </BottomSheet.Content>
          </BottomSheet.Portal>
        </BottomSheet>
        <Separator className="mx-4" />
        <BottomSheet>
          <BottomSheet.Trigger asChild>
            <ListGroup.Item>
              <ListGroup.ItemPrefix>
                <StyledIonicons
                  name="document-text-outline"
                  size={22}
                  className="text-foreground"
                />
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>{t("settings.terms.title")}</ListGroup.ItemTitle>
                <ListGroup.ItemDescription>
                  {t("settings.terms.description")}
                </ListGroup.ItemDescription>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix />
            </ListGroup.Item>
          </BottomSheet.Trigger>
          <BottomSheet.Portal>
            <BottomSheet.Overlay />
            <BottomSheet.Content
              snapPoints={["75%"]}
              enableDynamicSizing={false}
              contentContainerClassName="h-full"
            >
              <ScrollShadow className="flex-1" LinearGradientComponent={LinearGradient}>
                <BottomSheetScrollView
                  contentContainerClassName="gap-5 pb-8"
                  showsVerticalScrollIndicator={false}
                >
                  <BottomSheet.Title>{t("settings.terms.sheetTitle")}</BottomSheet.Title>
                  <Text className="font-semibold text-danger">
                    {t("settings.terms.draftNotice")}
                  </Text>
                  <View className="gap-1">
                    <Text className="text-base font-semibold text-foreground">
                      {t("settings.terms.collectionTitle")}
                    </Text>
                    <Text className="text-muted">{t("settings.terms.collectionBody")}</Text>
                  </View>
                  <View className="gap-1">
                    <Text className="text-base font-semibold text-foreground">
                      {t("settings.terms.useTitle")}
                    </Text>
                    <Text className="text-muted">{t("settings.terms.useBody")}</Text>
                  </View>
                  <View className="gap-1">
                    <Text className="text-base font-semibold text-foreground">
                      {t("settings.terms.contactTitle")}
                    </Text>
                    <Text className="text-muted">{t("settings.terms.contactBody")}</Text>
                  </View>
                </BottomSheetScrollView>
              </ScrollShadow>
            </BottomSheet.Content>
          </BottomSheet.Portal>
        </BottomSheet>
        <Separator className="mx-4" />
        <BottomSheet>
          <BottomSheet.Trigger asChild>
            <ListGroup.Item>
              <ListGroup.ItemPrefix>
                <StyledIonicons
                  name="information-circle-outline"
                  size={22}
                  className="text-foreground"
                />
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>{t("settings.info.title")}</ListGroup.ItemTitle>
                <ListGroup.ItemDescription>
                  {t("settings.info.description")}
                </ListGroup.ItemDescription>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix iconProps={{ size: 18, color: mutedColor }} />
            </ListGroup.Item>
          </BottomSheet.Trigger>
          <BottomSheet.Portal>
            <BottomSheet.Overlay />
            <BottomSheet.Content snapPoints={["45%"]}>
              <View className="gap-6">
                <View className="gap-1">
                  <Text className="text-base font-semibold text-foreground">
                    {t("settings.info.version", { version: appVersion })}
                  </Text>
                </View>
                <View className="gap-1">
                  <Text className="text-base font-semibold text-foreground">
                    {t("settings.info.licensesTitle")}
                  </Text>
                  <Text className="text-muted">{t("settings.info.licensesDescription")}</Text>
                </View>
                <View className="gap-1">
                  <Text className="text-base font-semibold text-foreground">
                    {t("settings.info.sourceTitle")}
                  </Text>

                  <LinkButton
                    onPress={() => Linking.openURL("https://github.com/anton3x/Fluently")}
                    className="self-start flex-row items-center gap-2"
                  >
                    <Ionicons name="logo-github" size={16} />
                    <Text>{t("settings.info.githubLink")}</Text>
                  </LinkButton>
                </View>
              </View>
            </BottomSheet.Content>
          </BottomSheet.Portal>
        </BottomSheet>
      </ListGroup>
    </ScrollView>
  );
}
