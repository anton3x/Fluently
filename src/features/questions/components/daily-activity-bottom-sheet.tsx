import { FlatList, View } from "react-native";
import { BottomSheet, ListGroup, PressableFeedback, Spinner, Typography } from "heroui-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { withUniwind } from "uniwind";
import { DailyActivity } from "@/db/schema";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const StyledIonicons = withUniwind(Ionicons);

const getActivityLevel = (questionsAnswered: number) => {
  if (questionsAnswered === 0) return "bg-muted/20";
  if (questionsAnswered < 5) return "bg-success/30";
  if (questionsAnswered < 10) return "bg-success/60";

  return "bg-success";
};

const formatDate = (date: string) => {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

type DailyActivityBottomSheetProps = {
  dailyActivity: DailyActivity[];
  isLoading: boolean;
};

export default function DailyActivityBottomSheet({
  dailyActivity,
  isLoading,
}: Readonly<DailyActivityBottomSheetProps>) {
  const [selectedDay, setSelectedDay] = useState<DailyActivity | null>(null);
  const { t } = useTranslation();

  return (
    <BottomSheet>
      <BottomSheet.Trigger asChild disabled={isLoading}>
        <ListGroup.Item>
          <ListGroup.ItemPrefix>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <StyledIonicons name="calendar-outline" size={22} className="text-foreground" />
            )}
          </ListGroup.ItemPrefix>

          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>{t("settings.activity.title")}</ListGroup.ItemTitle>

            <ListGroup.ItemDescription>
              {isLoading
                ? t("settings.activity.loading", "Loading…")
                : `${dailyActivity.length} ${t("settings.activity.daysTracked")}`}
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>

          <ListGroup.ItemSuffix />
        </ListGroup.Item>
      </BottomSheet.Trigger>

      <BottomSheet.Portal>
        <BottomSheet.Overlay />

        <BottomSheet.Content snapPoints={["65%"]} enableDynamicSizing={false}>
          <View className="mb-6 gap-2">
            <BottomSheet.Title>{t("settings.activity.title")}</BottomSheet.Title>
            <BottomSheet.Description>{t("settings.activity.description")}</BottomSheet.Description>
          </View>

          <FlatList
            data={dailyActivity}
            numColumns={7}
            keyExtractor={(item) => item.date.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 24,
            }}
            columnWrapperStyle={{
              gap: 6,
            }}
            renderItem={({ item }) => (
              <PressableFeedback
                onPress={() => setSelectedDay(item)}
                className="mb-1"
                style={{
                  width: "13.5%",
                  aspectRatio: 1,
                }}
              >
                <View
                  className={`h-full w-full rounded-sm ${getActivityLevel(
                    item.questionsAnswered ?? 0
                  )}`}
                />
                <PressableFeedback.Ripple
                  animation={{
                    backgroundColor: { value: "white" },
                    opacity: { value: [0, 0.3, 0] },
                  }}
                />
              </PressableFeedback>
            )}
          />

          {/* Detail panel replaces the tooltip */}
          <View className="mb-4 h-6 flex-row items-center">
            {selectedDay ? (
              <Typography type="body-sm">
                {formatDate(selectedDay.date)} · {selectedDay.questionsAnswered ?? 0}{" "}
                {(selectedDay.questionsAnswered ?? 0) === 1 ? "question" : "questions"} answered
              </Typography>
            ) : (
              <Typography type="body-sm" color="muted">
                Tap a day to see details
              </Typography>
            )}
          </View>

          <View className="mt-4 gap-2">
            <Typography type="body-sm" className="font-medium">
              Activity
            </Typography>

            <View className="flex-row items-center gap-2">
              <View className="size-3 rounded-[3px] bg-muted/20" />
              <Typography type="body-xs" color="muted">
                0
              </Typography>

              <View className="size-3 rounded-[3px] bg-success/30" />
              <Typography type="body-xs" color="muted">
                1–4
              </Typography>

              <View className="size-3 rounded-[3px] bg-default-soft-hover" />
              <Typography type="body-xs" color="muted">
                5–9
              </Typography>

              <View className="size-3 rounded-[3px] bg-success" />
              <Typography type="body-xs" color="muted">
                10+
              </Typography>
            </View>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
