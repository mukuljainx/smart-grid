// todo
// calculate position based on height
// After the first render, we don't have to repeat the calculation cycle again
// each time a row will be rendered and we can get it's height and move on.

import React, { createRef, useCallback, useRef, useState } from 'react';

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

const useVirtualization = ({
  limit = 20,
  buffer = 20,
  rowHeight,
  totalCount,
  dynamicHeight,
  loadMoreOffset = Infinity,
  loadMore,
}: IProps) => {
  const [visible, setVisible] = useState(0);
  const [_, setRenderCount] = useState(0);
  const scrollPosition = useRef(0);
  const heightCache = useRef<number[]>([]);
  const heightToBeCalculated = useRef<number[]>([]);
  const positionCache = useRef<number[]>([]);
  const lastRowPosition = useRef<number>(0);
  const rowRefs = useRef<React.RefObject<HTMLElement>[]>([]);
  const calculatingHeight = useRef(false);

  const getTopRowIndex = React.useCallback(
    (scrollTop: number) => {
      if (!dynamicHeight) {
        return Math.round(scrollTop / rowHeight);
      }

      if (dynamicHeight) {
        if (positionCache.current.length === 0) {
          return 0;
        }
        const index = positionCache.current.findIndex(
          (position) => position > scrollTop
        );
        return index === -1 ? 0 : Math.max(0, index);
      }

      return 0;
    },
    [dynamicHeight, rowHeight]
  );

  const onScroll = useCallback(
    (event: React.UIEvent<HTMLElement>) => {
      const table = event.target as HTMLElement;
      const scrollTop = table.scrollTop;
      const tableHeight = table.clientHeight;
      const sp = getTopRowIndex(scrollTop);
      // Incase where loadMoreOffset is totalCount-1
      // sp will never reach there until table height is also equal to rowHeight
      // this creates another offset which computed based on tableHeight and a magic number
      const loadMoreOffsetFuse = totalCount - tableHeight / rowHeight - 3;

      if (loadMore && sp >= Math.min(loadMoreOffsetFuse, loadMoreOffset)) {
        loadMore(sp);
      }
      if (scrollPosition.current !== sp) {
        scrollPosition.current = sp;
        setVisible(sp);
      }
    },
    [setVisible, getTopRowIndex, totalCount]
  );

  const virtualizedRows = useCallback(
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
      for (let i = start; i < end; i++) {
        if (dynamicHeight && data[i] && !heightCache.current[i]) {
          rowRefs.current[i] = createRef();
          heightToBeCalculated.current.push(i);
        }
      }

      let extraRowCounter = 0;
      for (let i = start; i < end; i++) {
        let currentRowPosition = 0;
        let opacity = 1;

        if (dynamicHeight) {
          opacity = data[i] && positionCache.current[i] === undefined ? 0 : 1;
          if (positionCache.current[i] !== undefined && data[i]) {
            currentRowPosition = positionCache.current[i];
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
              opacity,
              transform: `translateY(${currentRowPosition}px)`,
              position: 'absolute',
            },
            i,
            rowRefs.current[i]
          )
        );
      }
      return rowsUI;
    },
    [buffer, limit, totalCount, visible, rowHeight, dynamicHeight]
  );

  React.useEffect(() => {
    if (heightToBeCalculated.current.length) {
      heightToBeCalculated.current.forEach((i) => {
        heightCache.current[i] = rowRefs.current[i].current?.clientHeight || 0;
      });
      calculatingHeight.current = false;
      let position = 0;
      heightCache.current.forEach((height, index) => {
        positionCache.current[index] = position;
        lastRowPosition.current = position + height;
        position += height;
      });
      // prevents render when only one row is scrolled as
      // that will be done next cycle!
      if (heightToBeCalculated.current.length > 1) {
        setRenderCount((x) => x + 1);
      }
      heightToBeCalculated.current = [];
    }
  });

  return { onScroll, virtualizedRows };
};

export default useVirtualization;
