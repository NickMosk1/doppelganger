import styled from 'styled-components';
import { colors } from '../../theme/colors';

export const DialogContent = styled.div`
  padding: 8px 0;
`;

export const DialogMessage = styled.p<{ $type?: 'warning' | 'danger' | 'info' }>`
  font-size: 14px;
  color: ${props => 
    props.$type === 'danger' ? '#ef4444' :
    props.$type === 'warning' ? '#f59e0b' :
    colors.text
  };
  line-height: 1.5;
  margin: 0;
`;
