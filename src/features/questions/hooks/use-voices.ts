import * as Speech from "expo-speech";
import { useQuery } from "@tanstack/react-query";

export function useVoices() {
  return useQuery({
    queryKey: ["voices"],
    queryFn: async () => {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices;
    },
  });
}
