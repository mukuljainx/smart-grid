// todo
// calculate position based on height
// After the first render, we don't have to repeat the calculation cycle again
// each time a row will be rendered and we can get it's height and move on.

import React, { createRef, useCallback, useRef, useState } from 'react';

interface IProps {
  limit?: number;
  buffer?: number;
  dynamicHeight?: boolean;
  // will be ingored in case of dynamic height
  rowHeight: number;
  totalCount: number;
}

const useVirtualization = ({
  limit = 20,
  buffer = 20,
  rowHeight,
  totalCount,
  dynamicHeight,
}: IProps) => {
  const [visible, setVisible] = useState(0);
  const [renderCount, setRenderCount] = useState(0);
  // const [calculatingHeight, setCalculatingHeight] = useState(false);
  const scrollPosition = useRef(0);
  const heightCache = useRef<number[]>([]);
  const heightToBeCalculated = useRef<number[]>([]);
  const positionCache = useRef<number[]>([]);
  const rowRefs = useRef<React.RefObject<HTMLElement>[]>([]);
  const calculatingHeight = useRef(false);

  const getTopRowIndex = React.useCallback(
    (scrollTop: number) => {
      if (!dynamicHeight) {
        return Math.round(scrollTop / rowHeight);
      }

      if (dynamicHeight) {
        if (positionCache.current.length === 0) {
          console.log('A');
          return 0;
        }
        const index = positionCache.current.findIndex(
          (position) => position > scrollTop
        );
        console.log('B', index);
        return index === -1 ? 0 : Math.max(0, index);
      }

      return 0;
    },
    [dynamicHeight, rowHeight]
  );

  const onScroll = useCallback(
    (event: React.UIEvent<HTMLElement>) => {
      const scrollTop = (event.target as HTMLElement).scrollTop;
      const sp = getTopRowIndex(scrollTop);

      if (scrollPosition.current !== sp) {
        scrollPosition.current = sp;
        setVisible(sp);
      }
    },
    [setVisible, getTopRowIndex]
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
        if (!heightCache.current[i]) {
          rowRefs.current[i] = createRef();
          heightToBeCalculated.current.push(i);
        }
      }

      for (let i = start; i < end; i++) {
        rowsUI.push(
          func(
            data[i],
            {
              opacity: positionCache.current[i] !== undefined ? 1 : 0,
              transform: `translateY(${
                dynamicHeight && positionCache.current[i]
                  ? positionCache.current[i]
                  : i * rowHeight
              }px)`,
              position: 'absolute',
            },
            i,
            rowRefs.current[i]
          )
        );
      }
      // }
      // console.log("ROW");
      return rowsUI;
    },
    [buffer, limit, totalCount, visible, rowHeight, dynamicHeight]
  );

  React.useEffect(() => {
    // console.log("USE_EFFECT");
    if (heightToBeCalculated.current.length) {
      heightToBeCalculated.current.forEach((i) => {
        heightCache.current[i] = rowRefs.current[i].current?.clientHeight || 0;
      });
      calculatingHeight.current = false;
      let position = 0;
      heightCache.current.forEach((height, index) => {
        positionCache.current[index] = position;
        position += height;
      });
      heightToBeCalculated.current = [];
      setRenderCount((x) => x + 1);
      // console.log("XXXX", positionCache);
    }
  });

  return { onScroll, virtualizedRows };
};

export default useVirtualization;
