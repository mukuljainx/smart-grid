import React, { useRef, useState } from 'react';
import { get2DArray } from '../util';

const useHeight = (count = 1) => {
  const [, setRenderCount] = useState(0);
  const heightCache = useRef<number[]>([]);
  const heightToBeCalculated = useRef<number[]>([]);
  const positionCache = useRef<number[]>([]);
  const lastRowPosition = useRef<number>(0);
  const tableHeight = useRef<number>(0);
  const rowRefs = useRef<React.RefObject<HTMLElement>[][]>(get2DArray(count));

  const clearAfter = React.useCallback((index: number) => {
    heightCache.current.length = index + 1;
    positionCache.current.length = index + 1;
  }, []);

  // we want this hook to render on each cycle so no dependency
  // eslint-disable-next-line
  React.useEffect(() => {
    if (heightToBeCalculated.current.length) {
      heightToBeCalculated.current.forEach((i) => {
        let height = 0;
        for (let tableIndex = 0; tableIndex < count; tableIndex++) {
          height = Math.max(
            height,
            rowRefs.current[tableIndex][i]?.current?.clientHeight || 0
          );
        }
        heightCache.current[i] = height;
      });
      let position = 0;
      heightCache.current.forEach((height, index) => {
        positionCache.current[index] = position;
        lastRowPosition.current = position + height;
        position += height;
        tableHeight.current = position;
      });
      // prevents render when only one row is scrolled as
      // that will be done next cycle!
      if (heightToBeCalculated.current.length > 1) {
        setRenderCount((x) => x + 1);
      }
      heightToBeCalculated.current = [];
    }
  });

  return {
    rowRefs,
    lastRowPosition,
    positionCache,
    heightToBeCalculated,
    heightCache,
    clearAfter,
    tableHeight,
    reRender: () => setRenderCount((r) => r + 1),
  };
};

export default useHeight;
