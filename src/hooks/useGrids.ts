import React, { createRef, useCallback, useRef, useState } from 'react';
import useVirtualization from './useVerticalScroll';
import useHeight from './useHeight';
import { get2DArray } from '../util';
import useScrollSync from './useScrollSync';
import useActions from './useActions';
import rowRendererHelper from './rowRendererHelper';

interface IProps {
  limit?: number;
  buffer?: number;
  dynamicHeight?: boolean;
  // minimum height in case of dynamicHeight
  rowHeight: number;
  loadMore?: (sp: number) => void;
  loadMoreOffset?: number;
  data: Array<any>;
  virtualized?: boolean;
}

const useGrids = (
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
  }: IProps
) => {
  const heightProps = useHeight(tableCount);
  const { onScroll, visible } = useVirtualization({
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
  };
};

export default useGrids;
