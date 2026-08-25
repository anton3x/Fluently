import type { QuestionWithOptions } from "@/types/question";
import Ionicons from "@react-native-vector-icons/ionicons";
import * as Crypto from "expo-crypto";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { ListGroup } from "heroui-native";
import { Alert } from "react-native";
import { withUniwind } from "uniwind";
import type { QuestionsImport } from "../schemas/question-upload";
import { questionsImportSchema } from "../schemas/question-upload";
import { useCreateQuestions } from "../hooks/use-create-questions";
import { useTranslation } from "react-i18next";

const StyledIonicons = withUniwind(Ionicons);

function toQuestionWithOptions(question: QuestionsImport[number]): QuestionWithOptions {
  const id = Crypto.randomUUID();
  const now = new Date();

  return {
    id,
    type: question.type,
    text: question.text,
    phonetic: question.phonetic,
    cefrLevel: question.cefrLevel,
    createdAt: now,
    progress: null,
    options: question.options.map((option) => ({
      id: Crypto.randomUUID(),
      questionId: id,
      language: option.language,
      text: option.text,
      isCorrect: option.isCorrect,
      createdAt: now,
      updatedAt: now,
    })),
  };
}

export default function QuestionUpload() {
  const { mutateAsync: createQuestions } = useCreateQuestions();
  const { t } = useTranslation();

  async function pickJsonFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      if (!file?.name.toLowerCase().endsWith(".json")) {
        throw new Error(t("questions.import.invalidFileType"));
      }

      let json: unknown;

      try {
        json = JSON.parse(await FileSystem.readAsStringAsync(file.uri));
      } catch {
        throw new Error(t("questions.import.invalidJson"));
      }

      const parsed = questionsImportSchema.safeParse(json);

      if (!parsed.success) {
        console.error("Question import validation failed:", parsed.error);
        throw new Error(t("questions.import.invalidFormat"));
      }

      const importedQuestions = parsed.data.map(toQuestionWithOptions);
      const createdQuestions = await createQuestions(importedQuestions);

      Alert.alert(
        t("questions.import.successTitle"),
        t("questions.import.successMessage", {
          imported: createdQuestions.length,
          plural: createdQuestions.length === 1 ? "" : "s",
          skipped: importedQuestions.length - createdQuestions.length,
        })
      );
    } catch (error) {
      Alert.alert(
        t("questions.import.failureTitle"),
        error instanceof Error
          ? t(error.message, { defaultValue: error.message })
          : t("questions.import.failureDescription")
      );
    }
  }

  return (
    <ListGroup.Item onPress={pickJsonFile}>
      <ListGroup.ItemPrefix>
        <StyledIonicons name="cloud-upload-outline" size={22} className="text-foreground" />
      </ListGroup.ItemPrefix>

      <ListGroup.ItemContent>
        <ListGroup.ItemTitle>{t("questions.import.title")}</ListGroup.ItemTitle>
        <ListGroup.ItemDescription>{t("questions.import.description")}</ListGroup.ItemDescription>
      </ListGroup.ItemContent>

      <ListGroup.ItemSuffix />
    </ListGroup.Item>
  );
}
