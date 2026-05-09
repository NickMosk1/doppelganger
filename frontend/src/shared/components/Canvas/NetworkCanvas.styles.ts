import styled from 'styled-components';

export const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  height: 100%;
  background: #f8fafc;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const CanvasWrapper = styled.div`
  width: 100%;
  height: 100%;

  .react-flow {
    background: #f8fafc;
  }

  .react-flow__node {
    cursor: pointer;
  }

  .react-flow__edge {
    cursor: pointer;
  }

  .react-flow__edge.selected {
    stroke: #e54848;
    stroke-width: 2;
  }

  .react-flow__edge-path {
    stroke: #94a3b8;
    stroke-width: 2;
    transition: all 0.2s ease;
  }

  .react-flow__edge-text {
    font-size: 10px;
    fill: #64748b;
  }

  .react-flow__edge.selected .react-flow__edge-path {
    stroke: #e54848 !important;
    stroke-width: 3 !important;
  }
`;
