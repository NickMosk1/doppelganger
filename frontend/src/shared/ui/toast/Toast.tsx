import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { ToastContainer, Icon, Message, CloseIcon } from "./Toast.styles";

export interface ToastProps {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 3000, onClose }) => {
  const [isExiting, setIsExiting] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success": return "✓";
      case "error": return "✗";
      case "warning": return "⚠";
      default: return "ℹ";
    }
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  return createPortal(
    <ToastContainer $type={type} className={isExiting ? "exiting" : ""} onClick={handleClose}>
      <Icon>{getIcon()}</Icon>
      <Message>{message}</Message>
      <CloseIcon>×</CloseIcon>
    </ToastContainer>,
    document.body
  );
};

export default Toast;
