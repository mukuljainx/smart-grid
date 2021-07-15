import useGrid from './hooks/useGrid';
import useGrids from './hooks/useGrids';
import HiddenScrollWrapper from './atoms/HiddenScrollWrapper';

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;
interface IGridProps<T> {
  limit?: number;
  buffer?: number;
  dynamicHeight?: boolean;
  // minimum height in case of dynamicHeight
  rowHeight: number;
  data: T[];
  loadMore?: (sp: number) => void;
  loadMoreOffset?: number;
  virtualized?: boolean;
}

export { useGrid, useGrids, HiddenScrollWrapper, IGridProps, ArrayElement };
