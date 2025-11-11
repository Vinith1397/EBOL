import { useRef } from "react";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { useLanguage } from "../contexts/LanguageContext";
import { useI18n } from "../i18n/I18nProvider";

export default function HeaderBar({theme}) {
  //const { lang, setLang } = useLanguage();
  const { lang, setLang, t } = useI18n();
  const menuRef = useRef(null);
  const start = (
    <div className="flex align-items-center gap-2 px-2">
      <span className="pi pi-truck" style={{ fontSize: 20 }} />
      <strong>ExpressBOL</strong>
    </div>
  );
   const items = [
    {
      label: "English",
      icon: "pi pi-flag",
      command: () => setLang("en"),
    },
    {
      label: "Español",
      icon: "pi pi-flag-fill",
      command: () => setLang("es"),
    },
  ];

  const end = (
    <div className="md:flex align-items-center pr-3">
      
      <Button
        label={lang === "es" ? "Idioma:es" : "Language: en"}
        icon="pi pi-globe"
        text
        onClick={(e) => menuRef.current.toggle(e)}
        aria-haspopup
        aria-controls="lang_menu"
        className="text-white"
      
      />
      <Menu model={items} popup ref={menuRef} id="lang_menu" />
    </div>
  );

  return (
    <Menubar
      start={start}
      end={end}
      // background: "var(--p-primary-color)"
      //style={{ background: "#9DC63F", border: "none", color: "#000" }}
      style={{ background: theme?"#0a4323":"#0a0a09ff", border: "none", color: "#ffffff" }}
      className="shadow-2"
    />
  );
}
