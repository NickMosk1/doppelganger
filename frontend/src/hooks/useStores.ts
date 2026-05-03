import { useContext } from "react";
import { StoreContext } from "../stores/StoreProvider";

export const useStores = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStores must be used within StoreProvider");
  }
  return context;
};
