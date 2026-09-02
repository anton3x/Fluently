import { QuestionWithOptions } from "@/types/question";
import Ionicons from "@react-native-vector-icons/ionicons";
import { BottomSheet, Input, PressableFeedback, Typography } from "heroui-native";
import { View } from "react-native";
import { withUniwind } from "uniwind";
import { BottomSheetFlashList } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { useMemo, useState, useCallback } from "react";

const StyledIonicons = withUniwind(Ionicons);

type QuestionListProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelect?: (question: QuestionWithOptions) => void;
  questions: QuestionWithOptions[];
};

export default function QuestionsBottomSheet({
  isOpen,
  onOpenChange,
  onSelect,
  questions,
}: QuestionListProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredQuestions = useMemo(
    () =>
      questions?.filter((question) =>
        question.text.toLowerCase().includes(searchQuery.toLowerCase())
      ) ?? [],
    [questions, searchQuery]
  );

  const renderItem = useCallback(
    ({ item: question }: { item: QuestionWithOptions }) => {
      const isCompleted = (question.progress?.timesCorrect ?? 0) > 0;

      return (
        <PressableFeedback
          className="flex-row items-center gap-3 overflow-hidden rounded-xl bg-surface p-4"
          onPress={() => {
            onSelect?.(question);
            onOpenChange(false);
          }}
        >
          <PressableFeedback.Highlight />

          <View className="size-9 items-center justify-center rounded-full bg-accent/10">
            <StyledIonicons
              name={question.type === "sentence" ? "chatbubble-outline" : "text-outline"}
              size={18}
              className="text-accent"
            />

            {isCompleted && (
              <View className="absolute -bottom-1 -right-1 size-4 items-center justify-center rounded-full bg-accent">
                <StyledIonicons name="checkmark" size={10} className="text-white" />
              </View>
            )}
          </View>

          <View className="flex-1 gap-1">
            <View className="flex-row items-center gap-1.5">
              <Typography className="font-medium">{question.text}</Typography>
            </View>

            <View className="flex-row items-center gap-2">
              <Typography type="body-xs" color="muted">
                {question.cefrLevel}
              </Typography>
              {question.progress && (question.progress.timesSeen ?? 0) > 0 && (
                <Typography type="body-xs" color="muted">
                  {question.progress.timesCorrect ?? 0}/{question.progress.timesSeen}
                </Typography>
              )}
            </View>
          </View>
        </PressableFeedback>
      );
    },
    [onSelect, onOpenChange]
  );

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />

        <BottomSheet.Content
          snapPoints={["50%", "85%"]}
          enableOverDrag={false}
          enableDynamicSizing={false}
          contentContainerClassName="h-full"
        >
          <View className="mb-5 gap-2 items-center">
            <BottomSheet.Title className="text-center">{t("questions.title")}</BottomSheet.Title>

            <BottomSheet.Description className="text-center">
              {t("questions.selectDescription", { count: questions?.length ?? 0 })}
            </BottomSheet.Description>
          </View>

          <Input
            placeholder={t("questions.searchPlaceholder")}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {filteredQuestions.length === 0 ? (
            <View className="flex-1 items-center justify-center gap-3 py-10">
              <StyledIonicons name="document-text-outline" size={48} className="text-muted" />
              <Typography color="muted">
                {searchQuery ? t("questions.noResults") : t("questions.empty")}
              </Typography>
            </View>
          ) : (
            <BottomSheetFlashList
              data={filteredQuestions}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerClassName="gap-3 pb-6"
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={QuestionListItemSeparator}
            />
          )}
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

function QuestionListItemSeparator() {
  return <View className="h-3" />;
}
