import { useQuery } from "@tanstack/react-query";
import { useQuestionRepository } from "../providers/questions-provider";

export function useQuestion(id?: string) {
  const repository = useQuestionRepository();

  return useQuery({
    queryKey: ["questions", id],
    queryFn: async () => {
      if (!id) return null;

      const result = await repository.getQuestionById(id);

      if (!result.success) return null;

      return result.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
