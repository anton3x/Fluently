import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuestionRepository } from "../providers/questions-provider";
import { QuestionWithOptions } from "@/types/question";

export function useCreateQuestions() {
  const repository = useQuestionRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: QuestionWithOptions[]) => {
      const result = await repository.createQuestions(input);

      if (!result.success) throw new Error(result.error);

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });
}
