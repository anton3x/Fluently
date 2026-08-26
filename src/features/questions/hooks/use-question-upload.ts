import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Alert } from "react-native";
import { QuestionsImport, questionsImportSchema } from "../schemas/question-upload";
import { useCreateQuestions } from "../hooks/use-create-questions";
import { useTranslation } from "react-i18next";
import { QuestionWithOptions } from "@/types/question";
import * as Crypto from "expo-crypto";

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

export async function parseQuestionsFile(jsonString: string): Promise<QuestionWithOptions[]> {
  const json = JSON.parse(jsonString);

  const parsed = questionsImportSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error("questions.import.invalidFormat");
  }

  return parsed.data.map(toQuestionWithOptions);
}

export async function extractQuestionsFromFile(fileUri: string): Promise<string> {
  let json: unknown;

  try {
    json = JSON.parse(await FileSystem.readAsStringAsync(fileUri));
  } catch {
    throw new Error("questions.import.invalidJson");
  }

  return JSON.stringify(json);
}

export function useQuestionUpload() {
  const { mutateAsync: createQuestions, isPending } = useCreateQuestions();
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

      const fileContent = await extractQuestionsFromFile(file.uri);
      const importedQuestions = await parseQuestionsFile(fileContent);
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

  return { pickJsonFile, isPending };
}
