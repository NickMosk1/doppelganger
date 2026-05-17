import React from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "../../../hooks/useStores";
import Toast from "./Toast";

const ToastContainer: React.FC = observer(() => {
  const { toastStore } = useStores();

  return (
    <>
      {toastStore.toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={() => toastStore.hide(toast.id)}
        />
      ))}
    </>
  );
});

export default ToastContainer;
