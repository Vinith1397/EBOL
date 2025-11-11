import HeaderBar from "../src/componets/HeaderBar.jsx";
import FooterBar from "../src/componets/FooterBar.jsx";
import AppRoutes from "./routes.jsx";
import LanguageProvider from "../src/contexts/LanguageContext.jsx";
import I18nProvider from "./i18n/I18nProvider";
import { ThemeContext } from "./i18n/ThemeProvider.jsx";
import {useContext } from "react";

export default function App() {
 const {theme} = useContext(ThemeContext);
  return (
    <I18nProvider>
    <div className="app-shell">
      <HeaderBar theme={theme} />
      <main className="" style={{minWidth:'60%'}}>
        <AppRoutes />
      </main>
      <FooterBar theme={theme}/>
    </div>
    </I18nProvider>
    
  );
}
