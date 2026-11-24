
import AppRoutes from "./routes/AppRoutes";

import { PreferencesProvider } from "./context/PreferencesContext";

import "./styles/global.css";
import "./styles/components.css";

function App() {
  return (
    <PreferencesProvider>
      <AppRoutes />
    </PreferencesProvider>
  );
}

export default App;
