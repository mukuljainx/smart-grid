import React, { useCallback, useRef, useState } from 'react';

export interface IProps {
  dynamicHeight?: boolean;
  rowHeight: number;
  totalCount: number;
  loadMore?: (sp: number) => void;
  loadMoreOffset?: number;
  positionCache: number[];
  virtualized?: boolean;
}

const useVerticalScroll = ({
  totalCount,
  loadMoreOffset = Infinity,
  loadMore,
  dynamicHeight,
  positionCache,
  rowHeight,
  virtualized,
}: IProps) => {
  const [visible, setVisible] = useState(0);
  const scrollPosition = useRef(0);

  const getTopRowIndex = React.useCallback(
    (scrollTop: number) => {
      if (!dynamicHeight) {
        return Math.round(scrollTop / rowHeight);
      }

      if (dynamicHeight) {
        if (positionCache.length === 0) {
          return 0;
        }
        const index = positionCache.findIndex(
          (position) => position > scrollTop
        );
        return index === -1 ? 0 : Math.max(0, index);
      }

      return 0;
    },
    [dynamicHeight, rowHeight, positionCache]
  );

  const onScroll = useCallback(
    (event: React.UIEvent<HTMLElement>) => {
      if (event.currentTarget !== event.target) {
        return;
      }

      const table = event.target as HTMLDivElement;
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
      if (scrollPosition.current !== sp && virtualized) {
        scrollPosition.current = sp;
        setVisible(sp);
      }
    },
    [
      setVisible,
      getTopRowIndex,
      totalCount,
      rowHeight,
      virtualized,
      loadMore,
      loadMoreOffset,
    ]
  );

  return { onScroll, visible };
};

export default useVerticalScroll;
