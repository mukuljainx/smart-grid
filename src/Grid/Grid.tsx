import * as React from 'react';
import { throttle, debounce } from 'throttle-debounce';

import './grid.scss';
import Cell from './Atoms/Cell';
import Header from './Header';
import Loader, { PartialLoader } from './Loader';

type IDivProps = JSX.IntrinsicElements['div'];

export interface ISchema {
  width: number;
  template: React.ElementType;
  pinned?: 'LEFT';
  get: (props: any) => any;
  header: React.ElementType;
}

interface ICache {
  row: Record<string, { left: React.ReactElement; center: React.ReactElement }>;
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
}

interface IState {
  isScrolling: Boolean;
  position: number;
  gridMeta: {
    leftSchema: ISchema[];
    centerSchema: ISchema[];
    leftWidth: number;
    centerWidth: number;
  };
}

class Grid extends React.PureComponent<IProps, IState> {
  // Refs
  centerGridRef: React.RefObject<HTMLDivElement> = React.createRef();
  centerScrollRef: React.RefObject<HTMLDivElement> = React.createRef();
  centerHeaderRef: React.RefObject<HTMLDivElement> = React.createRef();
  gridRef: React.RefObject<HTMLDivElement> = React.createRef();

  // rows height map
  // rows height will be saved here after first calculation until changed
  calculatedRowHeight: number[] = [];
  calculatedRowTopPosition: number[] = [];
  calculateRowHeight = false;

  // Load more metadata
  loadMoreDataPosition = {
    position: -1,
    end: -1,
  };

  // Cache row with there index
  cache: ICache = {
    row: {},
    height: [],
  };

  public static defaultProps = {
    buffer: 25,
  };

  constructor(props: IProps) {
    super(props);
    this.state = {
      position: 0,
      isScrolling: false,
      gridMeta: this.updateSchema(this.props.schema),
    };
  }

  componentDidUpdate(prevProps: IProps, prevState: IState) {
    if (prevProps.schema !== this.props.schema) {
      this.setState({ gridMeta: this.updateSchema(this.props.schema) });
    }

    if (this.props.dynamicRowHeight && this.calculateRowHeight) {
      this.calculateRowHeight = false;
      if (this.props.data && prevProps.data !== this.props.data) {
        this.calulateRowHeightAndRender();
      }

      if (this.state.position !== prevState.position) {
        this.calulateRowHeightAndRender();
      }
    }
  }

  calulateRowHeightAndRender = () => {
    const leftRows = document.querySelectorAll(
      '.grid .grid-body .grid-left-body .row'
    );
    const centerRows = document.querySelectorAll(
      '.grid .grid-body .grid-center-body .row'
    );

    if (leftRows.length === 0) {
      return;
    }

    leftRows.forEach((row, nodeIndex) => {
      const index = parseInt(row.getAttribute('data-row'), 10);
      if (this.calculatedRowHeight[index]) {
        return;
      }

      const height = Math.max(
        leftRows[nodeIndex].clientHeight,
        centerRows[nodeIndex].clientHeight
      );

      this.calculatedRowHeight[index] = height;
      if (index !== 0) {
        if (this.calculatedRowTopPosition[index - 1] !== undefined) {
          this.calculatedRowTopPosition[index] =
            this.calculatedRowTopPosition[index - 1] +
            this.calculatedRowHeight[index - 1];
        }
      } else {
        this.calculatedRowTopPosition[index] = 0;
      }
    });
    this.forceUpdate();
  };

  getVisibleRowsCount = () =>
    this.gridRef.current
      ? Math.round(this.gridRef.current.offsetHeight / this.props.rowHeight)
      : 0;

  getScrollPosition = () => {
    if (!this.gridRef.current) {
      return 0;
    }

    const scrollTop = this.gridRef.current.scrollTop;
    const { dynamicRowHeight, rowHeight } = this.props;
    if (!dynamicRowHeight) {
      return Math.round(scrollTop / this.props.rowHeight);
    }

    const index = this.calculatedRowTopPosition.findIndex(
      position => position > scrollTop
    );

    if (index !== -1) {
      return Math.max(index, 0);
    }

    if (this.calculatedRowTopPosition.length === 0) {
      return 0;
    }

    return (
      Math.round(
        (scrollTop -
          this.calculatedRowTopPosition[
            this.calculatedRowTopPosition.length - 1
          ]) /
          rowHeight
      ) + this.calculatedRowTopPosition.length
    );
  };

  sync = throttle(75, false, (scrollLeft: number, scrollTarget: any) => {
    if (
      this.centerGridRef.current &&
      scrollTarget !== this.centerGridRef.current
    ) {
      this.centerGridRef.current.scrollLeft = scrollLeft;
    }
    if (
      this.centerScrollRef.current &&
      scrollTarget !== this.centerScrollRef.current
    ) {
      this.centerScrollRef.current.scrollLeft = scrollLeft;
    }
    if (
      this.centerHeaderRef.current &&
      scrollTarget !== this.centerHeaderRef.current
    ) {
      this.centerHeaderRef.current.scrollLeft = scrollLeft;
    }
  });

  // TODO: add proper types for scroll events
  syncHorizontalScroll = (event: any) => {
    const scrollLeft = event.target.scrollLeft;
    const scrollTarget = event.target;

    this.sync(scrollLeft, scrollTarget);
  };

  updateSchema = (schema: ISchema[]) => {
    const leftSchema = schema.filter(({ pinned }) => pinned === 'LEFT');
    const centerSchema = schema.filter(({ pinned }) => !pinned);

    const leftWidth = leftSchema.reduce(
      (total, current) => (total = total + current.width),
      0
    );

    const centerWidth = centerSchema.reduce(
      (total, current) => (total = total + current.width),
      0
    );

    return {
      leftSchema,
      centerSchema,
      leftWidth,
      centerWidth,
    };
  };

  handleGridScroll = (event: any) => {
    if (event.target !== this.gridRef.current) {
      return;
    }

    const scrollTop = event.target.scrollTop;
    if (scrollTop < 0) {
      return;
    }

    const { data } = this.props;
    const position = this.getScrollPosition();

    if (Math.abs(position - this.state.position) < 1) {
      return;
    }

    const visibleCount = this.getVisibleRowsCount();

    this.setState({ isScrolling: true, position });

    // set scrolling to false once scroll is paused for a definite time
    this.debouncedSetScroll(false);

    this.loadMoreData(position, visibleCount, data.length);
  };

  debouncedSetScroll = debounce(300, false, (isScrolling: boolean) => {
    this.setState({ isScrolling });
  });

  loadMoreData = (
    currentPosition: number,
    visibleCount: number,
    dataLength: number
  ) => {
    if (
      currentPosition > this.loadMoreDataPosition.position &&
      dataLength > this.loadMoreDataPosition.end &&
      currentPosition > dataLength - 1.5 * visibleCount
    ) {
      if (this.props.loadMore) {
        this.props.loadMore();
      }
      this.loadMoreDataPosition = {
        position: currentPosition,
        end: dataLength,
      };
    }
  };

  getHiddenRowStyling = (index: number): React.CSSProperties => {
    const { dynamicRowHeight } = this.props;

    if (
      !dynamicRowHeight ||
      this.calculatedRowTopPosition[index] ||
      index === 0
    ) {
      return undefined;
    }

    return { position: 'fixed', top: -10000, visibility: 'hidden' };
  };

  createRow = ({
    index,
    rowHeight,
    row,
    schema,
    dynamicRowHeight,
  }: {
    index: number;
    rowHeight?: IProps['rowHeight'];
    row: IProps['data'][0];
    schema: IProps['schema'];
    dynamicRowHeight: boolean;
  }) => {
    return (
      <div
        data-row={index}
        style={{
          width: '100%',
          height: dynamicRowHeight
            ? this.calculatedRowHeight[index]
            : rowHeight,
          transform: `translateY(${this.getTopPosition(index)}px)`,
          ...this.getHiddenRowStyling(index),
        }}
        className={`row ${row.className || ''}`}
        key={index}
      >
        {schema.map(({ width, template, get }, j) => (
          <Cell
            rowIndex={index}
            key={j}
            width={width}
            template={template}
            {...get(row)}
          />
        ))}
      </div>
    );
  };

  getVirtualList = (state: IState, props: IProps) => {
    const leftRows = [];
    const centerRows = [];

    const {
      gridMeta: { leftSchema, centerSchema },
    } = state;
    const { buffer, data, rowHeight, dynamicRowHeight } = props;

    const position = this.getScrollPosition();

    const visibleCount = this.getVisibleRowsCount();
    let start = Math.max(position - visibleCount - buffer!, 0);
    const end = Math.min(position + visibleCount + buffer!, data.length - 1);
    const rowCache = this.cache.row;
    const heightCache = this.cache.height;

    // We can approximate where the user has landed but we can
    // show if the correct row there unitl we have redered all the
    // previous rows once
    // expect the case when table is first rendered
    if (
      dynamicRowHeight &&
      !this.calculatedRowTopPosition[position] &&
      position !== 0
    ) {
      start = Math.min(this.calculatedRowTopPosition.length - 1, start);
    }
    ``;

    for (let index = start; index <= end; index++) {
      if (index === data.length) {
        break;
      }

      // To stop unnecessary renders
      this.calculateRowHeight = !this.calculateRowHeight
        ? this.getTopPosition(index) === undefined
        : this.calculateRowHeight;

      if (
        dynamicRowHeight
          ? heightCache[index] && rowCache[index]
          : rowCache[index]
      ) {
        leftRows.push(rowCache[index].left);
        centerRows.push(rowCache[index].center);
      } else {
        const row = data[index];
        heightCache[index] = this.calculatedRowHeight[index];

        rowCache[index] = {
          left: null,
          center: null,
        };
        // Left grid
        rowCache[index].left = this.createRow({
          schema: leftSchema,
          index,
          rowHeight,
          row,
          dynamicRowHeight,
        });

        leftRows.push(rowCache[index].left);

        // Center grid
        rowCache[index].center = this.createRow({
          schema: centerSchema,
          index,
          rowHeight,
          row,
          dynamicRowHeight,
        });
        centerRows.push(rowCache[index].center);
      }
    }

    return { leftGrid: leftRows, centerGrid: centerRows };
  };

  getTopPosition = (index: number) => {
    const { dynamicRowHeight } = this.props;
    if (!dynamicRowHeight) {
      return this.props.rowHeight * index;
    }

    if (dynamicRowHeight) {
      return this.calculatedRowTopPosition[index];
    }
  };

  getHeaderRef = (ref: React.RefObject<HTMLDivElement>) => {
    this.centerHeaderRef = ref;
  };

  getGridHeight = () => {
    const { dynamicRowHeight, data, rowHeight, loadingMoreData } = this.props;

    if (!dynamicRowHeight) {
      return data.length * rowHeight + (loadingMoreData ? rowHeight * 2 : 0);
    }

    let total = 0;

    data.forEach((__, index) => {
      total += this.calculatedRowHeight[index] || rowHeight;
    });

    return total;
  };

  render() {
    const {
      data,
      schema: __,
      loadMore: __1,
      buffer: __2,
      dynamicRowHeight,
      rowHeight,
      loading,
      loader,
      overlay,
      showOverlay,
      loadingMoreData,
      headerHeight,
      className,
      ...rest
    } = this.props;

    const { gridMeta } = this.state;
    const visibleCount = this.getVisibleRowsCount();

    const girdRestProps = {
      className: `craft-smart-grid ${className || ''}`,
      ...rest,
    };

    if (visibleCount === -1) {
      return (
        <div ref={this.gridRef} style={this.props.style}>
          Loading No Mounted yet
        </div>
      );
    }

    if (loading) {
      if (loader) {
        return loader;
      }
      return (
        <div {...girdRestProps} ref={this.gridRef}>
          <Loader
            rows={visibleCount > 0 ? visibleCount + 1 : undefined}
            rowHeight={rowHeight}
          />
        </div>
      );
    }

    if (showOverlay) {
      return (
        <div ref={this.gridRef} {...girdRestProps}>
          {overlay}
        </div>
      );
    }

    const { leftGrid, centerGrid } = this.getVirtualList(
      this.state,
      this.props
    );

    // Clear cache to save memory or it can lead to page crash
    if (!this.state.isScrolling) {
      this.cache = {
        ...this.cache,
        row: {},
      };
    }

    let gridHeight = this.getGridHeight();

    if (dynamicRowHeight) {
      gridHeight += rowHeight * 2;
    }

    return (
      <div {...girdRestProps}>
        <Header
          getRef={this.getHeaderRef}
          centerSchema={gridMeta.centerSchema}
          leftSchema={gridMeta.leftSchema}
          centerWidth={gridMeta.centerWidth}
          leftWidth={gridMeta.leftWidth}
          headerHeight={headerHeight}
          syncHorizontalScroll={this.syncHorizontalScroll}
        />

        {/* Grid Body */}
        <div
          className="grid"
          ref={this.gridRef}
          onScroll={this.handleGridScroll}
        >
          <div
            style={{
              height: gridHeight,
            }}
            className="grid-body"
          >
            {/*
             * Left Pinned Grid
             */}
            {gridMeta.leftWidth > 0 && (
              <div style={{ width: gridMeta.leftWidth }} className="grid-left">
                <div className="grid-left-body">
                  {leftGrid}
                  {loadingMoreData && (
                    <PartialLoader
                      style={{
                        transform: `translateY(${
                          dynamicRowHeight
                            ? gridHeight - rowHeight * 2
                            : this.getTopPosition(data.length)
                        }px)`,
                      }}
                      schema={gridMeta.leftSchema}
                      className="partial-loader"
                      rowStyle={{ height: rowHeight }}
                    />
                  )}
                </div>
              </div>
            )}
            {/*
             * Center Grid
             */}
            {gridMeta.centerWidth > 0 && (
              <div
                style={{ width: `calc(100% - ${gridMeta.leftWidth}px)` }}
                className="grid-center"
              >
                <div
                  ref={this.centerGridRef}
                  className="grid-center-body hide-scroll-bar"
                  onScroll={this.syncHorizontalScroll}
                >
                  <div
                    style={{ minWidth: gridMeta.centerWidth }}
                    className="grid-center-body-inner"
                  >
                    {centerGrid}
                    {loadingMoreData && (
                      <PartialLoader
                        schema={gridMeta.centerSchema}
                        style={{
                          transform: `translateY(${
                            dynamicRowHeight
                              ? gridHeight - rowHeight * 2
                              : this.getTopPosition(data.length)
                          }px)`,
                        }}
                        className="partial-loader"
                        rowStyle={{
                          height: rowHeight,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="grid-scroll">
          <div
            className="grid-scroll-left"
            style={{ width: gridMeta.leftWidth }}
          />
          <div
            style={{
              width: `calc(100% - ${gridMeta.leftWidth}px)`,
            }}
            className="grid-scroll-center overflow-y-hidden"
            ref={this.centerScrollRef}
            onScroll={this.syncHorizontalScroll}
          >
            <div style={{ width: gridMeta.centerWidth }} />
          </div>
        </div>
      </div>
    );
  }
}

export default Grid;
