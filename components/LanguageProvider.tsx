"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Lang, dictionary } from "@/lib/dictionary";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dictionary["en"]) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("sohoj-lang") as Lang | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading persisted preference on mount
    if (saved === "en" || saved === "bn") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(l: Lang) {
    setLangState(l);
    window.localStorage.setItem("sohoj-lang", l);
  }

  function translate(key: keyof typeof dictionary["en"]) {
    return dictionary[lang][key] ?? dictionary.en[key];
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
