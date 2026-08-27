import { useQuery } from "@tanstack/react-query";
import { useQuestionRepository } from "../providers/questions-provider";

export function useQuestions() {
  const repository = useQuestionRepository();

  return useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      const result = await repository.getQuestions();

      if (!result.success) return null;

      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
