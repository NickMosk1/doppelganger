"use client";

import { createContext, ReactNode, FC, useEffect, useState } from "react";
import RootStore from "../root.store";
import AuthStore from "../auth.store";
import UserStore from "../user.store";
import { AUTH_STORE, USER_STORE } from "../identifiers";
import Injector from "../../utils/injector";

interface StoreContextValue {
  rootStore: RootStore;
  authStore: AuthStore;
  userStore: UserStore;
}

export const StoreContext = createContext<StoreContextValue | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

const StoreProvider: FC<StoreProviderProps> = ({ children }) => {
  const [rootStore, setRootStore] = useState<StoreContextValue | undefined>();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const rootStr = new RootStore();
      setRootStore({
        rootStore: rootStr,
        authStore: rootStr.authStore,
        userStore: rootStr.userStore,
      });
    }
  }, []);

  if (rootStore) {
    Injector.register(AUTH_STORE, rootStore.authStore);
    Injector.register(USER_STORE, rootStore.userStore);

    return (
      <StoreContext.Provider value={{ ...rootStore }}>
        {children}
      </StoreContext.Provider>
    );
  }

  return null;
};

export default StoreProvider;
