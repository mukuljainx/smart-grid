import * as React from 'react';
import HiddenScrollWrapper, { HeaderProps } from '../atoms/HiddenScrollWrapper';

import { get2DArray } from '../util';

const useScrollSync = (tableCount: number) => {
  const tableArray = get2DArray(tableCount);
  const headerRef = React.useRef<React.RefObject<HTMLElement>[]>(
    tableArray.map((_) => React.createRef())
  );
  const bodyRef = React.useRef<React.RefObject<HTMLElement>[]>(
    tableArray.map((_) => React.createRef())
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

  const horizontalSync = tableArray.map((_, i) => onScroll(i));
  const GridHeaders: React.FC<HeaderProps>[] = horizontalSync.map(
    (handleScroll, i) => (props) =>
      (
        <HiddenScrollWrapper
          {...props}
          ref={headerRef.current[i] as any}
          onScroll={handleScroll}
        />
      )
  );
  const GridBodies: React.FC<HeaderProps>[] = horizontalSync.map(
    (handleScroll, i) => (props) =>
      (
        <HiddenScrollWrapper
          {...props}
          ref={bodyRef.current[i] as any}
          onScroll={handleScroll}
        />
      )
  );

  return {
    headerRef: headerRef.current,
    bodyRef: bodyRef.current,
    horizontalSync,
    GridHeaders,
    GridBodies,
  };
};

export default useScrollSync;
