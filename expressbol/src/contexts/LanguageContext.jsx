import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageCtx = createContext({ lang: "en", setLang: () => {} });
export const useLanguage = () => useContext(LanguageCtx);

export default function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang; // sets <html lang="...">
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang }), [lang]);
  return <LanguageCtx.Provider value={value}>{children}</LanguageCtx.Provider>;
}
