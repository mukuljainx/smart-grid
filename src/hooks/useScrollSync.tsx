import * as React from 'react';
import HiddenScrollWrapper, { HeaderProps } from '../atoms/HiddenScrollWrapper';
import ScrollBar from '../atoms/ScrollBar';

import { get2DArray } from '../util';

const useScrollSync = (tableCount: number) => {
  const tableArray = React.useRef(get2DArray(tableCount));
  const headerRef = React.useRef<React.RefObject<HTMLElement>[]>(
    tableArray.current.map(() => React.createRef())
  );
  const bodyRef = React.useRef<React.RefObject<HTMLElement>[]>(
    tableArray.current.map(() => React.createRef())
  );
  const footRef = React.useRef<React.RefObject<HTMLElement>[]>(
    tableArray.current.map(() => React.createRef())
  );

  const onScroll = React.useCallback(
    (tableIndex: number) => (event: React.UIEvent<HTMLElement>) => {
      if (
        event.currentTarget === headerRef.current[tableIndex].current &&
        bodyRef.current[tableIndex].current &&
        footRef.current[tableIndex].current
      ) {
        footRef.current[tableIndex].current.scrollLeft =
          headerRef.current[tableIndex].current?.scrollLeft;
        bodyRef.current[tableIndex].current.scrollLeft =
          headerRef.current[tableIndex].current?.scrollLeft;
      } else if (
        event.currentTarget === bodyRef.current[tableIndex].current &&
        headerRef.current[tableIndex].current &&
        footRef.current[tableIndex].current
      ) {
        headerRef.current[tableIndex].current.scrollLeft =
          bodyRef.current[tableIndex].current.scrollLeft;
        footRef.current[tableIndex].current.scrollLeft =
          bodyRef.current[tableIndex].current.scrollLeft;
      } else if (
        event.currentTarget === footRef.current[tableIndex].current &&
        headerRef.current[tableIndex].current &&
        bodyRef.current[tableIndex].current
      ) {
        headerRef.current[tableIndex].current.scrollLeft =
          footRef.current[tableIndex].current.scrollLeft;
        bodyRef.current[tableIndex].current.scrollLeft =
          footRef.current[tableIndex].current.scrollLeft;
      }
    },
    []
  );

  const horizontalSync = React.useMemo(
    () => tableArray.current.map((_, i) => onScroll(i)),
    [onScroll, tableArray]
  );
  const GridHeaders: React.FC<HeaderProps>[] = React.useMemo(
    () =>
      horizontalSync.map((handleScroll, i) => (props) => (
        <HiddenScrollWrapper
          {...props}
          //eslint-disable-next-line
          ref={headerRef.current[i] as any}
          onScroll={handleScroll}
        />
      )),
    [horizontalSync]
  );
  const GridBodies: React.FC<HeaderProps>[] = React.useMemo(
    () =>
      horizontalSync.map((handleScroll, i) => (props) => (
        <HiddenScrollWrapper
          {...props}
          //eslint-disable-next-line
          ref={bodyRef.current[i] as any}
          onScroll={handleScroll}
        />
      )),
    [horizontalSync]
  );
  const ScrollBars: React.FC<HeaderProps>[] = React.useMemo(
    () =>
      horizontalSync.map((handleScroll, i) => (props) => (
        <ScrollBar
          {...props}
          //eslint-disable-next-line
          ref={footRef.current[i] as any}
          onScroll={handleScroll}
        />
      )),
    [horizontalSync]
  );

  return {
    headerRef: headerRef.current,
    bodyRef: bodyRef.current,
    footRef: footRef.current,
    horizontalSync,
    GridHeaders,
    GridBodies,
    ScrollBars,
  };
};

export default useScrollSync;
