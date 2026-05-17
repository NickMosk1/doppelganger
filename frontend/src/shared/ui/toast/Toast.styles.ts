import styled, { keyframes } from "styled-components";
import { colors } from "../../theme";

export const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

export const ToastContainer = styled.div<{ $type: "success" | "error" | "info" | "warning" }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: ${props => {
    switch (props.$type) {
      case "success": return "#10b981";
      case "error": return "#ef4444";
      case "warning": return "#f59e0b";
      default: return colors.primary;
    }
  }};
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  font-weight: 500;
  animation: ${slideIn} 0.3s ease forwards;
  min-width: 280px;
  max-width: 400px;
  cursor: pointer;
  
  &.exiting {
    animation: ${slideOut} 0.3s ease forwards;
  }
`;

export const Icon = styled.div`
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Message = styled.div`
  flex: 1;
  line-height: 1.4;
`;

export const CloseIcon = styled.span`
  font-size: 18px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
`;
