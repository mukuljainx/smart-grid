import * as React from 'react';
import useVerticalScroll from './useVerticalScroll';
import useHeight from './useHeight';

interface IProps {
  limit?: number;
  buffer?: number;
  dynamicHeight?: boolean;
  // minimum height in case of dynamicHeight
  rowHeight: number;
  data: any[];
  loadMore?: (sp: number) => void;
  loadMoreOffset?: number;
  virtualized?: boolean;
}

const useTable = ({
  limit = 20,
  buffer = 20,
  rowHeight,
  data,
  dynamicHeight,
  loadMoreOffset = Infinity,
  loadMore,
  virtualized = true,
}: IProps) => {
  const {
    rowRefs,
    lastRowPosition,
    positionCache,
    heightToBeCalculated,
    heightCache,
    tableHeight: tableHeightX,
  } = useHeight();
  const { onScroll, visible } = useVerticalScroll({
    loadMore,
    loadMoreOffset,
    positionCache: positionCache.current,
    rowHeight,
    dynamicHeight,
    totalCount: data.length,
    virtualized,
  });
  let tableHeight: string | number =
    tableHeightX.current || data.length * rowHeight;

  const tableRenderer = React.useCallback(
    (
      func: (
        row: any,
        style: React.CSSProperties,
        index: number,
        ref?: any
      ) => React.ReactNode
    ) => {
      const start = virtualized ? Math.max(visible - buffer, 0) : 0;
      const end = virtualized
        ? Math.min(visible + limit + buffer, data.length)
        : data.length;

      let rowsUI: React.ReactNode[] = [];
      tableHeight = data.length * rowHeight;

      heightToBeCalculated.current = [];
      if (dynamicHeight) {
        for (let i = start; i < end; i++) {
          if (data[i] && !heightCache.current[i]) {
            rowRefs.current[0][i] = React.createRef();
            heightToBeCalculated.current.push(i);
          }
        }
      }

      let extraRowCounter = 0;
      for (let i = start; i < end; i++) {
        let currentRowPosition = 0;
        let opacity = 1;
        let height = rowHeight;

        if (dynamicHeight && virtualized) {
          opacity = data[i] && positionCache.current[i] === undefined ? 0 : 1;
          if (positionCache.current[i] !== undefined && data[i]) {
            currentRowPosition = positionCache.current[i];
            height = heightCache.current[i];
          } else {
            currentRowPosition =
              lastRowPosition.current + extraRowCounter * rowHeight;
            extraRowCounter++;
          }
        } else {
          currentRowPosition = i * rowHeight;
        }

        rowsUI.push(
          func(
            data[i],
            {
              height,
              opacity,
              transform: virtualized
                ? `translateY(${currentRowPosition}px)`
                : undefined,
              position: virtualized ? 'absolute' : 'inherit',
            },
            i,
            rowRefs.current[0][i]
          )
        );
      }

      return rowsUI;
    },
    [buffer, limit, data, visible, rowHeight, dynamicHeight]
  );

  return { onScroll, tableRenderer, tableHeight };
};

export default useTable;
