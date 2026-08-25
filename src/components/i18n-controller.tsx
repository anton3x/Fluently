import { useEffect } from "react";

import i18n from "@/i18n";
import { useSettingsStore } from "@/stores/settings";

export function I18nController() {
  const language = useSettingsStore((state) => state.language);
  const hasHydrated = useSettingsStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated) i18n.changeLanguage(language);
  }, [hasHydrated, language]);

  return null;
}
