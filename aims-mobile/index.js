import { registerRootComponent } from "expo";
import App from "./App";

// Context (from src/)
import { AuthProvider } from "./src/context/AuthContext";

function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

registerRootComponent(Root);
