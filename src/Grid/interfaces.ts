type IDivProps = JSX.IntrinsicElements['div'];

export interface ISchema {
  width: number;
  template: React.ElementType;
  pinned?: 'LEFT' | 'RIGHT';
  get: (props: any) => any;
  header: React.ElementType;
}

export interface ICache {
  row: Record<
    string,
    {
      left: React.ReactElement;
      center: React.ReactElement;
      right: React.ReactElement;
    }
  >;
  height: number[];
}

export interface ObjectLiteral {
  [k: string]: any;
}

export interface IProps extends IDivProps {
  data: ObjectLiteral[];
  schema: ISchema[];
  /**
   * In case of dynamic height this will be taken
   * as minimun height
   */
  rowHeight: number;
  headerHeight: number;
  /**
   * Function which is invoked when user is about to reach
   * the end
   */

  loadMore?: () => void;
  /**
   * extra rows to be rendered
   * above and below visible table
   */
  buffer?: number;
  /**
   * Shows the loader
   */
  loading?: boolean;
  /**
   * This will render if loading is true
   * parent element will gird's first div
   */
  loader?: React.ReactChild;
  /**
   * Will show loader in last two rows
   */
  loadingMoreData?: boolean;
  /**
   * Will show overlay in place of grid
   */
  showOverlay?: boolean;
  overlay?: React.ReactChild;
  /**
   * Each row height will be calculated dynamically
   * Given row height will be considered as minimun row height
   */
  dynamicRowHeight?: boolean;
  /**
   * Grid will be virtualized only visible and buffered rows will be
   * rendered in the dom
   */
  virtualization?: boolean;
  /**
   * Assign the gridActions to passed variable
   */
  getGridActions?: (gridActions?: IGridActions) => void;
  /**
   * Triggers loadmore when n number of rows are remaining
   */
  loadMoreThreshold?: number;

  rowProps?: IRowProps;
}

export interface IRowProps {
  onClick?: (rowIndex: number, gridPosition: GridPosition) => void;
  onMouseEnter?: (rowIndex: number, gridPosition: GridPosition) => void;
  onMouseLeave?: (rowIndex: number, gridPosition: GridPosition) => void;
}

export interface IState {
  isScrolling: Boolean;
  position: number;
  gridMeta: {
    leftSchema: ISchema[];
    centerSchema: ISchema[];
    rightSchema: ISchema[];
    leftWidth: number;
    centerWidth: number;
    rightWidth: number;
  };
}

export interface IGridActions {
  refreshRows: (indexs: number[], all?: boolean) => void;
  scrollToTop: () => void;
  refreshLoadMoreCache: () => void;
}

export type GridPosition = 'LEFT' | 'CENTER' | 'RIGHT';
