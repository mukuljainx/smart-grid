import * as React from 'react';
import useVerticalScroll from './useVerticalScroll';
import useHeight from './useHeight';
import useActions from './useActions';
import rowRendererHelper from './rowRendererHelper';

export interface IGridProps {
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

const useGrid = ({
  limit = 20,
  buffer = 20,
  rowHeight,
  data,
  dynamicHeight,
  loadMoreOffset = Infinity,
  loadMore,
  virtualized = true,
}: IGridProps) => {
  const tableRef = React.useRef();
  const heightProps = useHeight();
  const { onScroll, visible } = useVerticalScroll({
    loadMore,
    loadMoreOffset,
    positionCache: heightProps.positionCache.current,
    rowHeight,
    dynamicHeight,
    totalCount: data.length,
    virtualized,
  });
  const actions = useActions({
    positionCache: heightProps.positionCache,
    tableRef,
    heightCache: heightProps.heightCache,
    lastRowPosition: heightProps.lastRowPosition,
    clearAfter: heightProps.clearAfter,
    reRender: heightProps.reRender,
  });
  let tableHeight: string | number =
    heightProps.tableHeight.current || data.length * rowHeight;
  const tableIndex = 0;

  const rowRenderer = React.useCallback(
    (
      func: (
        row: any,
        style: React.CSSProperties,
        index: number,
        ref?: any
      ) => React.ReactNode
    ) =>
      rowRendererHelper({
        rowFunc: func,
        visible,
        tableIndex,
        rowHeight,
        limit,
        buffer,
        virtualized,
        dynamicHeight,
        data,
        heightCache: heightProps.heightCache,
        heightToBeCalculated: heightProps.heightToBeCalculated,
        lastRowPosition: heightProps.lastRowPosition,
        positionCache: heightProps.positionCache,
        rowRefs: heightProps.rowRefs,
      }),
    [buffer, limit, data, visible, rowHeight, dynamicHeight]
  );

  return { onScroll, rowRenderer, tableHeight, tableRef, actions };
};

export default useGrid;
