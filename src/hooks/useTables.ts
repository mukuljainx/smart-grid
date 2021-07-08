import React, { createRef, useCallback, useRef, useState } from 'react';
import useVirtualization from './useVerticalScroll';
import useHeight from './useHeight';
import { get2DArray } from '../util';
import useScrollSync from './useScrollSync';
import useActions from './useActions';

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

const useTables = (
  tableCount: number,
  {
    limit = 20,
    buffer = 20,
    rowHeight,
    totalCount,
    dynamicHeight,
    loadMoreOffset = Infinity,
    loadMore,
  }: IProps
) => {
  const heightProps = useHeight(tableCount);
  const { onScroll, visible } = useVirtualization({
    loadMore,
    loadMoreOffset,
    positionCache: heightProps.positionCache.current,
    rowHeight,
    dynamicHeight,
    totalCount,
  });
  const { horizontalSync, headerRef, bodyRef } = useScrollSync(tableCount);
  const tableRef = React.useRef();
  const actions = useActions({
    positionCache: heightProps.positionCache,
    tableRef,
    heightCache: heightProps.heightCache,
    lastRowPosition: heightProps.lastRowPosition,
    clearAfter: heightProps.clearAfter,
  });

  const tableRenderer = useCallback(
    (tableIndex) =>
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

        heightProps.heightToBeCalculated.current = [];
        for (let i = start; i < end; i++) {
          if (dynamicHeight && data[i] && !heightProps.heightCache.current[i]) {
            heightProps.rowRefs.current[tableIndex][i] = createRef();
            heightProps.heightToBeCalculated.current.push(i);
          }
        }

        let extraRowCounter = 0;

        for (let i = start; i < end; i++) {
          let currentRowPosition = 0;
          let opacity = 1;
          let height = undefined;

          if (dynamicHeight) {
            opacity =
              data[i] && heightProps.positionCache.current[i] === undefined
                ? 0
                : 1;
            if (heightProps.positionCache.current[i] !== undefined && data[i]) {
              currentRowPosition = heightProps.positionCache.current[i];
              height = heightProps.heightCache.current[i];
            } else {
              height = rowHeight;
              currentRowPosition =
                heightProps.lastRowPosition.current +
                extraRowCounter * rowHeight;
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
                zIndex: opacity === 0 ? -1 : undefined,
                transform: `translateY(${currentRowPosition}px)`,
                position: 'absolute',
              },
              i,
              heightProps.rowRefs.current[tableIndex][i]
            )
          );
        }
        return rowsUI;
      },
    [buffer, limit, totalCount, visible, rowHeight, dynamicHeight]
  );

  const tableRenderers = get2DArray(tableCount).map((_, i) => tableRenderer(i));

  return {
    onScroll,
    tableRenderers,
    tableHeight: heightProps.lastRowPosition.current,
    horizontalSync,
    headerRef,
    bodyRef,
    tableRef,
    actions,
  };
};

export default useTables;
