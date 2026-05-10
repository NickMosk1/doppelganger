import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { HomePage, LoginPage, SchemaEditorPage, SchemasPage } from "./pages";
import StoreProvider from "./stores/StoreProvider";
import { useStores } from "./hooks/useStores";
import { AppLayout, GlobalStyles } from "./shared";
import "reactflow/dist/style.css";

const AppContent = observer(() => {
  const { userStore, authStore } = useStores();
  const isAuthenticated = userStore.isAuthenticated;

  const handleLogout = () => {
    authStore.logout();
  };

  return (
    <AppLayout onLogout={handleLogout}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/home"
          element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/schemas"
          element={isAuthenticated ? <SchemasPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/editor/:id"
          element={isAuthenticated ? <SchemaEditorPage /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/home" />} />
      </Routes>
    </AppLayout>
  );
});

const App = () => {
  return (
    <>
      <GlobalStyles />
      <StoreProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </StoreProvider>
    </>
  );
};

export default App;
