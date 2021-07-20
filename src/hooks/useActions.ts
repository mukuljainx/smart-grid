import * as React from 'react';

export interface IProps {
  positionCache: React.MutableRefObject<number[]>;
  heightCache: React.MutableRefObject<number[]>;
  lastRowPosition: React.MutableRefObject<number>;
  // eslint-disable-next-line
  tableRef: any;
  clearAfter: (row: number) => void;
  reRender: () => void;
}

const useActions = ({
  positionCache,
  tableRef,
  clearAfter,
  reRender,
}: IProps) => {
  const scrollToRow = React.useCallback(
    (row: number) => {
      tableRef.current.scrollTop = positionCache.current[row];
    },
    [tableRef, positionCache]
  );

  const getRowPosition = React.useCallback(
    (row: number) => {
      return positionCache.current[row];
    },
    [positionCache]
  );

  const clear = (index: number) => {
    const table = tableRef.current as HTMLElement;
    const rowPosition = getRowPosition(index);
    clearAfter(index - 1);
    if (
      rowPosition >= table.scrollTop &&
      rowPosition <= table.scrollTop + table.clientHeight
    ) {
      return reRender();
    }
    scrollToRow(index - 1);
  };

  return { scrollToRow, clear, getRowPosition };
};

export default useActions;
