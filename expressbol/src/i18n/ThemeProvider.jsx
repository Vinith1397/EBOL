import { createContext, useContext, useEffect, useMemo, useState } from "react";
export const ThemeContext =createContext();
export default function ThemeProvider({children}){
    const [theme,setTheme]=useState(false);
    return ( <ThemeContext.Provider value={{theme,setTheme}}>{children}</ThemeContext.Provider>);
}