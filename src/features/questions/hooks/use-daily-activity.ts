import { useQuery } from "@tanstack/react-query";
import { useDailyActivityRepository } from "../providers/daily-activity-provider";

export function useDailyActivity() {
  const repository = useDailyActivityRepository();

  return useQuery({
    queryKey: ["dailyActivity"],
    queryFn: async () => {
      const result = await repository.getAll();

      if (!result.success) return null;

      return result.data;
    },
  });
}
