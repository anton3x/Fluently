import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProgressRepository } from "../providers/progress-provider";

type RecordAnswerInput = {
  questionId: string;
  isCorrect: boolean;
};

export function useRecordAnswer() {
  const progress = useProgressRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RecordAnswerInput) => {
      const result = await progress.recordAnswer(input);

      if (!result.success) throw new Error(result.error);

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });
}
