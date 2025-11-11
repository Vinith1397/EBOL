import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "./translations";

const I18nCtx = createContext({ lang: "en", t: (k)=>k, setLang: ()=>{} });
export const useI18n = () => useContext(I18nCtx);

export default function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key, vars) => {
    // simple dot-path resolver: "checkin.apptId"
    const parts = key.split(".");
    let cur = translations[lang] || translations.en;
    for (const p of parts) cur = (cur || {})[p];
    let str = cur ?? key; // fallback to key
    if (vars && typeof str === "string") {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`{${k}}`, "g"), String(v));
      });
    }
    return str;
  };

  const value = useMemo(() => ({ lang, setLang, t }), [lang]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}
