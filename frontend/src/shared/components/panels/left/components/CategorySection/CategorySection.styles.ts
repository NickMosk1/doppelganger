import styled from 'styled-components';
import { colors } from '../../../../../theme';

export const CategoryWrapper = styled.div`
  margin: 10px 0px;
  border: 1px solid ${colors.border};
  border-radius: 12px;
  overflow: hidden;
  background: ${colors.white};
`;

export const CategoryHeader = styled.div`
  padding: 10px 12px;
  background: ${colors.background};
  border-bottom: 1px solid ${colors.border};
  font-weight: 600;
  font-size: 12px;
  color: ${colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 8px;
  padding: 12px;
`;
