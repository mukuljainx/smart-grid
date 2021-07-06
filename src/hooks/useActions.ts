import * as React from 'react';

interface IProps {
  positionCache: React.MutableRefObject<number[]>;
  heightCache: React.MutableRefObject<number[]>;
  lastRowPosition: React.MutableRefObject<number>;
  tableRef: any;
  clearAfter: (row: number) => void;
}

const useActions = ({ positionCache, tableRef, clearAfter }: IProps) => {
  const scrollToRow = React.useCallback((row: number) => {
    tableRef.current.scrollTop = positionCache.current[row];
  }, []);

  const clear = (index: number) => {
    clearAfter(index);
    scrollToRow(index - 1);
  };

  const getRowPosition = React.useCallback((row: number) => {
    return positionCache.current[row];
  }, []);

  return { scrollToRow, clear, getRowPosition };
};

export default useActions;
