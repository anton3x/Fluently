import { useQuery } from "@tanstack/react-query";
import { useProgressRepository } from "../providers/progress-provider";

export function useProgress() {
  const repository = useProgressRepository();

  return useQuery({
    queryKey: ["progress"],
    queryFn: async () => {
      const result = await repository.getProgress();

      if (!result.success) return null;

      return result.data;
    },
  });
}
