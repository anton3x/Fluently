import { useState } from "react";
import * as Speech from "expo-speech";
export type SpeechVoice = Speech.Voice;

export function useVoices() {
  const [voices, setVoices] = useState<SpeechVoice[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadVoices() {
    setLoading(true);
    setError(null);

    try {
      const result = await Speech.getAvailableVoicesAsync();
      setVoices(result);
    } catch {
      setError("settings.voice.loadError");
    } finally {
      setLoading(false);
    }
  }

  return {
    voices,
    isLoading,
    error,
    loadVoices,
  };
}
