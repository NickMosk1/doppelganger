import styled from 'styled-components';

export const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
  gap: 8px;
  padding: 8px 0 16px 0;
`;
