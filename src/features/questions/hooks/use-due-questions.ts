import { useQuery } from "@tanstack/react-query";
import { useQuestionRepository } from "../providers/questions-provider";

export function useDueQuestions() {
  const repository = useQuestionRepository();

  return useQuery({
    queryKey: ["questions", "due"],
    queryFn: async () => {
      const result = await repository.getDueQuestions();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}