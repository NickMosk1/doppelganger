import { useState, useCallback, useRef, useEffect } from 'react';

export const useResizePanel = (initialWidth: number = 320, minWidth: number = 200, maxWidth: number = 500) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const isDraggingRef = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    const delta = e.clientX - startXRef.current;
    let newWidth = startWidthRef.current + delta;
    
    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;
    
    setWidth(newWidth);
  }, [minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    
    isDraggingRef.current = false;
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    window.dispatchEvent(new Event('resize'));
  }, [handleMouseMove]);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDraggingRef.current) return;
    
    isDraggingRef.current = true;
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [width, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [handleMouseMove, handleMouseUp]);

  return { width, isResizing, startResize };
};
