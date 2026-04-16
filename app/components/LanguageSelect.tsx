"use client";

import { useI18n } from "../utils/i18n";

export function LanguageSelect() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="fixed right-6 top-6 z-[70] flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-3 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.08)] backdrop-blur">
      <span className="text-xs font-medium text-stone-600">{t("language")}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as "en" | "ko")}
        className="rounded-full border border-black/10 bg-[#faf7f1] px-3 py-1 text-sm outline-none"
        aria-label={t("language")}
      >
        <option value="en">{t("english")}</option>
        <option value="ko">{t("korean")}</option>
      </select>
    </div>
  );
}
