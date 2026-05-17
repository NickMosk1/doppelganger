"use client";

import { createContext, ReactNode, FC, useEffect, useState } from "react";
import { AUTH_STORE, CATALOG_STORE, DRAFT_STORE, EDITOR_STORE, SCHEMA_STORE, SIMULATION_STORE, TOAST_STORE, USER_STORE } from "../identifiers";
import Injector from "../../utils/injector";
import RootStore from "../root.store";
import AuthStore from "../auth.store";
import UserStore from "../user.store";
import EditorStore from "../editor.store";
import CatalogStore from "../catalog.store";
import SchemaStore from "../schema.store";
import DraftStore from "../draft.store";
import SimulationStore from "../simulation.store";
import ToastStore from "../toast.store";

interface StoreContextValue {
  rootStore: RootStore;
  authStore: AuthStore;
  userStore: UserStore;
  editorStore: EditorStore;
  catalogStore: CatalogStore;
  schemaStore: SchemaStore;
  draftStore: DraftStore;
  simulationStore: SimulationStore;
  toastStore: ToastStore;
};

export const StoreContext = createContext<StoreContextValue | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
};

const StoreProvider: FC<StoreProviderProps> = ({ children }) => {
  const [rootStore, setRootStore] = useState<StoreContextValue | undefined>();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const rootStr = new RootStore();
      setRootStore({
        rootStore: rootStr,
        authStore: rootStr.authStore,
        userStore: rootStr.userStore,
        editorStore: rootStr.editorStore,
        catalogStore: rootStr.catalogStore,
        schemaStore: rootStr.schemaStore,
        draftStore: rootStr.draftStore,
        simulationStore: rootStr.simulationStore,
        toastStore: rootStr.toastStore,
      });
    }
  }, []);

  if (rootStore) {
    Injector.register(AUTH_STORE, rootStore.authStore);
    Injector.register(USER_STORE, rootStore.userStore);
    Injector.register(EDITOR_STORE, rootStore.editorStore);
    Injector.register(CATALOG_STORE, rootStore.catalogStore);
    Injector.register(SCHEMA_STORE, rootStore.schemaStore);
    Injector.register(DRAFT_STORE, rootStore.draftStore);
    Injector.register(SIMULATION_STORE, rootStore.simulationStore);
    Injector.register(TOAST_STORE, rootStore.toastStore);

    return (
      <StoreContext.Provider value={{ ...rootStore }}>
        {children}
      </StoreContext.Provider>
    );
  }

  return null;
};

export default StoreProvider;
