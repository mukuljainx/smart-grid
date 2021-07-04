import * as React from 'react';

import { get2DArray } from '../util';

const useScrollSync = (tableCount: number) => {
  const headerRef = React.useRef<React.RefObject<HTMLElement>[]>(
    get2DArray(tableCount).map((_) => React.createRef())
  );
  const bodyRef = React.useRef<React.RefObject<HTMLElement>[]>(
    get2DArray(tableCount).map((_) => React.createRef())
  );

  const onScroll = React.useCallback(
    (tableIndex: number) => (event: React.UIEvent<HTMLElement>) => {
      if (
        event.currentTarget === headerRef.current[tableIndex].current &&
        bodyRef.current[tableIndex].current
      ) {
        bodyRef.current[tableIndex].current.scrollLeft =
          headerRef.current[tableIndex].current?.scrollLeft;
      } else if (headerRef.current[tableIndex].current) {
        headerRef.current[tableIndex].current.scrollLeft =
          bodyRef.current[tableIndex].current.scrollLeft;
      }
    },
    []
  );

  const horizontalSync = get2DArray(tableCount).map((_, i) => onScroll(i));

  return {
    horizontalSync,
    headerRef: headerRef.current,
    bodyRef: bodyRef.current,
  };
};

export default useScrollSync;
