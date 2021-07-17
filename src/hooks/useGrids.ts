import React, { createRef, useCallback, useRef, useState } from 'react';
import useVerticalScroll from './useVerticalScroll';
import useHeight from './useHeight';
import { get2DArray } from '../util';
import useScrollSync from './useScrollSync';
import useActions from './useActions';
import rowRendererHelper from './rowRendererHelper';
import { IGridProps, ArrayElement } from '../index';

interface X {
  useGridType<T>(
    tableCount: number,
    params: IGridProps<T>
  ): {
    onScroll: ReturnType<typeof useVerticalScroll>['onScroll'];
    rowRenderers: Array<
      (
        func: (
          row: T,
          style: React.CSSProperties,
          index: number,
          ref?: React.RefObject<any>
        ) => React.ReactNode
      ) => React.ReactNode
    >;
    tableHeight: number;
    tableRef: React.RefObject<any>;
    actions: ReturnType<typeof useActions>;
    horizontalSync: ReturnType<typeof useScrollSync>['horizontalSync'];
    headerRef: ReturnType<typeof useScrollSync>['headerRef'];
    bodyRef: ReturnType<typeof useScrollSync>['bodyRef'];
    footRef: ReturnType<typeof useScrollSync>['footRef'];
    GridHeaders: ReturnType<typeof useScrollSync>['GridHeaders'];
    GridBodies: ReturnType<typeof useScrollSync>['GridBodies'];
    ScrollBars: ReturnType<typeof useScrollSync>['ScrollBars'];
  };
}

const useGrids: X['useGridType'] = (
  tableCount: number,
  {
    limit = 20,
    buffer = 20,
    rowHeight,
    dynamicHeight,
    loadMoreOffset = Infinity,
    loadMore,
    data,
    virtualized = true,
  }
) => {
  const heightProps = useHeight(tableCount);
  const { onScroll, visible } = useVerticalScroll({
    loadMore,
    loadMoreOffset,
    positionCache: heightProps.positionCache.current,
    rowHeight,
    dynamicHeight,
    totalCount: data.length,
    virtualized,
  });
  const {
    horizontalSync,
    headerRef,
    bodyRef,
    GridHeaders,
    GridBodies,
    ScrollBars,
    footRef,
  } = useScrollSync(tableCount);
  const tableRef = React.useRef();
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

  const rowRenderer = useCallback(
    (tableIndex) =>
      (
        func: (
          row: ArrayElement<typeof data>,
          style: React.CSSProperties,
          index: number,
          ref?: React.RefObject<any>
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
  const rowRenderers = get2DArray(tableCount).map((_, i) => rowRenderer(i));

  return {
    onScroll,
    rowRenderers,
    tableHeight,
    horizontalSync,
    headerRef,
    bodyRef,
    tableRef,
    actions,
    GridHeaders,
    GridBodies,
    ScrollBars,
    footRef,
  };
};

export default useGrids;
//
