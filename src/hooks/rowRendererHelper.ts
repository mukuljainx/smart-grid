import * as React from 'react';
import { IGridProps } from './useGrid';

interface IProps
  extends Pick<
    IGridProps,
    'virtualized' | 'buffer' | 'rowHeight' | 'limit' | 'data' | 'dynamicHeight'
  > {
  visible: number;
  tableIndex: number;
  rowFunc: any;
  heightToBeCalculated: { current: number[] };
  heightCache: { current: number[] };
  rowRefs: { current: any[] };
  positionCache: { current: number[] };
  lastRowPosition: { current: number };
}

const func = ({
  virtualized,
  buffer,
  limit,
  visible,
  rowHeight,
  data,
  heightToBeCalculated,
  dynamicHeight,
  tableIndex,
  heightCache,
  rowRefs,
  positionCache,
  lastRowPosition,
  rowFunc,
}: IProps) => {
  console.log('HELLO', tableIndex);
  const start = virtualized ? Math.max(visible - buffer, 0) : 0;
  const end = virtualized
    ? Math.min(visible + limit + buffer, data.length)
    : data.length;

  let rowsUI: React.ReactNode[] = [];

  heightToBeCalculated.current = [];
  if (dynamicHeight) {
    for (let i = start; i < end; i++) {
      if (data[i] && !heightCache.current[i]) {
        rowRefs.current[tableIndex][i] = React.createRef();
        heightToBeCalculated.current.push(i);
      }
    }
  }

  let extraRowCounter = 0;
  for (let i = start; i < end; i++) {
    let currentRowPosition = 0;
    let opacity = 1;
    let height = rowHeight;

    if (dynamicHeight && virtualized) {
      // if we will use the height above render with 0 opacity will
      // have the fixed height instead of it's true height
      height = undefined;
      opacity = data[i] && positionCache.current[i] === undefined ? 0 : 1;
      if (positionCache.current[i] !== undefined && data[i]) {
        currentRowPosition = positionCache.current[i];
        height = heightCache.current[i];
      } else {
        currentRowPosition =
          lastRowPosition.current + extraRowCounter * rowHeight;
        extraRowCounter++;
      }
    } else {
      currentRowPosition = i * rowHeight;
    }

    rowsUI.push(
      rowFunc(
        data[i],
        {
          height,
          opacity,
          transform: virtualized
            ? `translateY(${currentRowPosition}px)`
            : undefined,
          position: virtualized ? 'absolute' : 'inherit',
        },
        i,
        rowRefs.current[tableIndex][i]
      )
    );
  }

  return rowsUI;
};

export default func;
