import { useQuery } from "@tanstack/react-query";
import { useQuestionRepository } from "../providers/questions-provider";

export function useNextQuestion() {
  const repository = useQuestionRepository();

  return useQuery({
    queryKey: ["questions", "next"],
    queryFn: async () => {
      const result = await repository.getRandomQuestion();

      if (!result.success) return null;

      return result.data;
    },
  });
}