"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Locale = "tr" | "en";

type Translations = Record<string, string>;

type LangContext = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LangContext | undefined>(undefined);

async function fetchLocaleJSON(locale: Locale): Promise<Translations | null> {
  try {
    const res = await fetch(`/locales/${locale}.json`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Failed to fetch locale json", e);
    return null;
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await fetchLocaleJSON(locale);
      if (mounted && data) setTranslations(data);
    })();
    return () => { mounted = false };
  }, [locale]);

  function setLocale(l: Locale) {
    setLocaleState(l);
    // optionally persist to localStorage
    try { localStorage.setItem("locale", l); } catch {}
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem("locale") as Locale | null;
      if (saved) setLocaleState(saved);
    } catch {}
  }, []);

  function t(key: string) {
    return translations[key] ?? key;
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
