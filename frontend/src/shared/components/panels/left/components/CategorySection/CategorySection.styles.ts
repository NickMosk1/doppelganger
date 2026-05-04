import styled from 'styled-components';

export const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 8px;
  padding: 8px 0 12px 0;
  margin-left: 16px;
`;
