export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export interface IGridProps<T> {
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
