
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("carebridgeTheme") || "light"
  );

  const [direction, setDirection] = useState(
    () => localStorage.getItem("carebridgeDirection") || "ltr"
  );

  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (event) => {
      setSystemDark(event.matches);
    };

    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const activeTheme =
      theme === "system"
        ? systemDark ? "dark" : "light"
        : theme;

    document.documentElement.setAttribute("data-theme", activeTheme);
    document.documentElement.setAttribute("dir", direction);

    localStorage.setItem("carebridgeTheme", theme);
    localStorage.setItem("carebridgeDirection", direction);
  }, [theme, direction, systemDark]);

  const toggleDirection = () => {
    setDirection((current) =>
      current === "ltr" ? "rtl" : "ltr"
    );
  };

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        setTheme,
        direction,
        setDirection,
        toggleDirection,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error(
      "usePreferences must be used inside PreferencesProvider"
    );
  }

  return context;
}
