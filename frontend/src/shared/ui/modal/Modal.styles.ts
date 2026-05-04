import styled from 'styled-components';
import { colors } from '../../theme';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContainer = styled.div`
  background: ${colors.white};
  border-radius: 16px;
  min-width: 400px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 40px ${colors.shadow};
  animation: slideIn 0.2s ease;

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid ${colors.border};
`;

export const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.text};
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${colors.textLighter};
  transition: color 0.2s ease;

  &:hover {
    color: ${colors.primary};
  }
`;

export const ModalContent = styled.div`
  padding: 20px;
`;

export const ModalFooter = styled.div`
  padding: 16px 20px;
  border-top: 1px solid ${colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;
