import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProgressRepository } from "../providers/progress-provider";
import { useDailyActivityRepository } from "../providers/daily-activity-provider";

type RecordAnswerInput = {
  questionId: string;
  isCorrect: boolean;
};

export function useRecordAnswer() {
  const progress = useProgressRepository();
  const dailyActivity = useDailyActivityRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RecordAnswerInput) => {
      const result = await progress.recordAnswer(input);

      if (!result.success) throw new Error(result.error);

      const today = new Date().toISOString().split("T")[0];
      await dailyActivity.incrementCounts(today, input.isCorrect);

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["dailyActivity"] });
    },
  });
}
