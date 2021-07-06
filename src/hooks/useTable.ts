import * as React from 'react';
import useVirtualization from './useVirtualization';
import useHeight from './useHeight';

interface IProps {
  limit?: number;
  buffer?: number;
  dynamicHeight?: boolean;
  // minimum height in case of dynamicHeight
  rowHeight: number;
  totalCount: number;
  loadMore?: (sp: number) => void;
  loadMoreOffset?: number;
}

const useTable = ({
  limit = 20,
  buffer = 20,
  rowHeight,
  totalCount,
  dynamicHeight,
  loadMoreOffset = Infinity,
  loadMore,
}: IProps) => {
  const {
    rowRefs,
    lastRowPosition,
    positionCache,
    heightToBeCalculated,
    heightCache,
  } = useHeight();

  const { onScroll, visible } = useVirtualization({
    loadMore,
    loadMoreOffset,
    positionCache: positionCache.current,
    rowHeight,
    dynamicHeight,
    totalCount,
  });

  const tableRenderer = React.useCallback(
    (
      data: Array<any>,
      func: (
        row: any,
        style: React.CSSProperties,
        index: number,
        ref?: any
      ) => React.ReactNode
    ) => {
      const start = Math.max(visible - buffer, 0);
      const end = Math.min(visible + limit + buffer, totalCount);
      let rowsUI: React.ReactNode[] = [];

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

        if (dynamicHeight) {
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
              transform: `translateY(${currentRowPosition}px)`,
              position: 'absolute',
            },
            i,
            rowRefs.current[0][i]
          )
        );
      }

      return rowsUI;
    },
    [buffer, limit, totalCount, visible, rowHeight, dynamicHeight]
  );

  return { onScroll, tableRenderer };
};

export default useTable;
