import Ionicons from "@react-native-vector-icons/ionicons";
import { ListGroup, Spinner } from "heroui-native";
import { withUniwind } from "uniwind";
import { useTranslation } from "react-i18next";
import { useQuestionUpload } from "../hooks/use-question-upload";

const StyledIonicons = withUniwind(Ionicons);

export default function QuestionUpload() {
  const { pickJsonFile, isPending } = useQuestionUpload();
  const { t } = useTranslation();

  return (
    <ListGroup.Item onPress={pickJsonFile} disabled={isPending}>
      <ListGroup.ItemPrefix>
        {isPending ? (
          <Spinner size="sm" className="text-foreground" />
        ) : (
          <StyledIonicons name="cloud-upload-outline" size={22} className="text-foreground" />
        )}
      </ListGroup.ItemPrefix>

      <ListGroup.ItemContent>
        <ListGroup.ItemTitle>{t("questions.import.title")}</ListGroup.ItemTitle>
        <ListGroup.ItemDescription>{t("questions.import.description")}</ListGroup.ItemDescription>
      </ListGroup.ItemContent>

      <ListGroup.ItemSuffix />
    </ListGroup.Item>
  );
}
