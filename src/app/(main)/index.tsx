import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Button, Label, Radio, RadioGroup, Menu, Spinner, Typography } from "heroui-native";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useSettingsStore } from "@/stores/settings";
import { useTranslation } from "react-i18next";
import { useNextQuestion } from "@/features/questions/hooks/use-next-question";
import { useRecordAnswer } from "@/features/questions/hooks/use-record-answer";
import { QuestionEmptyState } from "@/features/questions/components/question-empty-state";
import { QuestionLoadingState } from "@/features/questions/components/question-loading-state";
import { QuestionErrorState } from "@/features/questions/components/question-error-state";
import { useProgress } from "@/features/questions/hooks/use-progress";
import QuestionsBottomSheet from "@/features/questions/components/question-list";
import { useQuestions } from "@/features/questions/hooks/use-questions";
import { useQuestion } from "@/features/questions/hooks/use-question";
import { shuffle } from "@/utils";

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const [answer, setAnswer] = useState<string>();
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const voiceId = useSettingsStore((state) => state.voiceId);
  const [isQuestionListOpen, setIsQuestionListOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>();
  const language = useSettingsStore((state) => state.language);
  const { t } = useTranslation();

  const { data: selectedQuestion, isPending: isLoadingSelectedQuestion } =
    useQuestion(selectedQuestionId);

  const { data: progress } = useProgress();
  const {
    data: nextQuestion,
    isPending: isLoadingQuestion,
    isError,
    isRefetching,
    refetch,
  } = useNextQuestion();
  const { data: questions, isPending: isLoadingQuestions } = useQuestions();
  const { mutateAsync: recordAnswer, isPending: isSavingAnswer } = useRecordAnswer();

  const question = selectedQuestionId ? selectedQuestion : nextQuestion;

  const isLoading =
    isLoadingQuestion ||
    isLoadingQuestions ||
    (selectedQuestionId ? isLoadingSelectedQuestion : false);

  const questionOptions = useMemo(
    () => (question?.options ?? []).filter((option) => option.language === language),
    [question?.options, language]
  );

  const shuffledOptions = useMemo(() => shuffle(questionOptions), [questionOptions]);

  if (isLoading) {
    return <QuestionLoadingState />;
  }

  if (isError) {
    return <QuestionErrorState />;
  }

  if (!question) {
    return <QuestionEmptyState />;
  }

  function selectAnswer(value: string) {
    setAnswer(value);
    setIsChecked(false);
  }

  function speakQuestion() {
    if (!question) return;

    Speech.stop();
    Speech.speak(question.text, { language: "en-US", pitch: 1, rate: 0.92, voice: voiceId });
  }

  function handleCheck(value: string | undefined) {
    if (!value) return;
    setIsChecked(true);
    const isCorrect = value === questionOptions.find((option) => option.isCorrect)?.text;
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setIsCorrect(isCorrect);
    return isCorrect;
  }
  async function handleNext() {
    if (!question) return;

    Speech.stop();

    await recordAnswer({
      questionId: question.id,
      isCorrect,
    });

    setSelectedQuestionId(undefined);
    setAnswer(undefined);
    setIsChecked(false);
    setIsCorrect(false);

    await refetch();
  }
  async function handleGetAnotherQuestion() {
    Speech.stop();

    setSelectedQuestionId(undefined);
    setAnswer(undefined);
    setIsChecked(false);
    setIsCorrect(false);

    await refetch();
  }

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom }}
    >
      <View className="flex-row items-center gap-3 px-5">
        <Menu>
          <Menu.Trigger asChild>
            <Button isIconOnly size="sm" variant="ghost" accessibilityLabel={t("practice.menu")}>
              <Ionicons name="ellipsis-horizontal" size={22} color="#3e4a37" />
            </Button>
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Overlay />
            <Menu.Content presentation="popover" width={250}>
              <Menu.Label className="mb-1">{t("practice.questions")}</Menu.Label>
              <Menu.Item
                isDisabled={isRefetching || isSavingAnswer}
                onPress={handleGetAnotherQuestion}
              >
                <Menu.ItemTitle>
                  {isRefetching || isSavingAnswer ? <Spinner /> : t("practice.randomQuestion")}
                </Menu.ItemTitle>
              </Menu.Item>
              <Menu.Item
                onPress={() => {
                  setIsQuestionListOpen(true);
                }}
              >
                <Menu.ItemTitle>{t("practice.openQuestionList")}</Menu.ItemTitle>
              </Menu.Item>
            </Menu.Content>
          </Menu.Portal>
        </Menu>

        <View className="h-3 flex-1 overflow-hidden rounded-full bg-default">
          <View
            className="h-full rounded-full bg-accent"
            style={{ width: `${progress?.percentage ?? 0}%` }}
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-5 pb-5 pt-10">
          <View className="items-center">
            <View className="mt-10 items-center gap-1">
              <Typography.Heading type="h2" className="text-center">
                {t("practice.prompt", { word: question.text })}
              </Typography.Heading>
              <View className="flex-row items-center gap-1">
                <Typography type="body-sm" color="muted">
                  {question.phonetic}
                </Typography>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  accessibilityLabel={t("practice.pronounce", { word: question.text })}
                  onPress={speakQuestion}
                >
                  <Ionicons name="volume-high-outline" size={18} color="#3e4a37" />
                </Button>
              </View>
            </View>
          </View>

          <RadioGroup value={answer} onValueChange={selectAnswer} className="mt-7 gap-3">
            {shuffledOptions.map((option) => (
              <RadioGroup.Item
                key={option.id}
                value={option.text}
                className="min-h-13 flex-row items-center justify-between rounded-xl border border-[#b9c7ae] bg-surface px-5"
              >
                <Label className="text-base font-semibold text-foreground">{option.text}</Label>
                <Radio />
              </RadioGroup.Item>
            ))}
          </RadioGroup>

          <View className="mt-auto pt-8">
            {isChecked && (
              <Typography
                type="body-sm"
                className={`mb-3 text-center font-semibold ${isCorrect ? "text-accent" : "text-danger"}`}
              >
                {isCorrect ? t("practice.correct") : t("practice.incorrect")}
              </Typography>
            )}
            {!isChecked ? (
              <Button
                size="lg"
                className="w-full"
                isDisabled={!answer}
                onPress={() => handleCheck(answer)}
              >
                {t("practice.check")}
              </Button>
            ) : (
              <Button size="lg" className="w-full" isDisabled={isSavingAnswer} onPress={handleNext}>
                {isSavingAnswer ? <Spinner /> : t("practice.next")}
              </Button>
            )}
          </View>
        </View>
      </ScrollView>
      <QuestionsBottomSheet
        isOpen={isQuestionListOpen}
        onOpenChange={setIsQuestionListOpen}
        questions={questions ?? []}
        onSelect={(selectedQuestion) => {
          Speech.stop();

          setSelectedQuestionId(selectedQuestion.id);

          setAnswer(undefined);
          setIsChecked(false);
          setIsCorrect(false);

          setIsQuestionListOpen(false);
        }}
      ></QuestionsBottomSheet>
    </View>
  );
}
