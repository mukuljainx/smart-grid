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

export interface ObjectLiteral {
  [k: string]: any;
}

export interface IProps extends IDivProps {
  data: ObjectLiteral[];
  schema: ISchema[];
  rowHeight: number;
  headerHeight: number;
  loadMore?: () => void;
  buffer?: number;
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

  // Load more metadata
  loadMoreDataPosition = {
    position: -1,
    end: -1,
  };

  // Cache row with there index
  cache: {
    row: Record<
      string,
      { left: React.ReactElement; center: React.ReactElement }
    >;
  } = {
    row: {},
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

  componentDidUpdate(prevProps: IProps) {
    if (prevProps.schema !== this.props.schema) {
      this.setState({ gridMeta: this.updateSchema(this.props.schema) });
    }
  }

  getVisibleRowsCount = () =>
    this.gridRef.current
      ? Math.round(this.gridRef.current.offsetHeight / this.props.rowHeight)
      : 0;

  getCurrentPosition = () =>
    this.gridRef.current
      ? Math.round(this.gridRef.current.scrollTop / this.props.rowHeight)
      : 0;

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

    const { rowHeight, data } = this.props;
    const position = Math.round(scrollTop / rowHeight);

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

  getVirtualList = (state: IState, props: IProps) => {
    const leftRows = [];
    const centerRows = [];

    const {
      position,
      gridMeta: { leftSchema, centerSchema },
    } = state;
    const { buffer, data, rowHeight } = props;

    const visibleCount = this.getVisibleRowsCount();
    const start = Math.max(position - visibleCount - buffer!, 0);
    const end = Math.min(position + visibleCount + buffer!, data.length - 1);
    const rowCache = this.cache.row;

    for (let index = start; index <= end; index++) {
      if (index === data.length) {
        break;
      }

      if (rowCache[index]) {
        leftRows.push(rowCache[index].left);
        centerRows.push(rowCache[index].center);
      } else {
        const row = data[index];

        rowCache[index] = { left: null, center: null };
        // Left grid
        rowCache[index].left = (
          <div
            data-row={index}
            style={{
              width: '100%',
              height: rowHeight,
              transform: `translateY(${this.getTopPosition(index)}px)`,
            }}
            className={`row ${row.className}`}
            key={index}
          >
            {leftSchema.map(({ width, template, get }, j) => (
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
        leftRows.push(rowCache[index].left);

        // Center grid
        rowCache[index].center = (
          <div
            data-row={index}
            style={{
              width: '100%',
              height: rowHeight,
              transform: `translateY(${this.getTopPosition(index)}px)`,
            }}
            className={`row ${row.className}`}
            key={index}
          >
            {centerSchema.map(({ width, template, get }, j) => (
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
        centerRows.push(rowCache[index].center);
      }
    }

    return { leftGrid: leftRows, centerGrid: centerRows };
  };

  getTopPosition = (index: number) => this.props.rowHeight * index;

  getHeaderRef = (ref: React.RefObject<HTMLDivElement>) => {
    this.centerHeaderRef = ref;
  };

  render() {
    const {
      data,
      schema: __,
      loadMore: __1,
      buffer: __2,
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
      className: `craft-smart-grid ${className}`,
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
        row: {},
      };
    }

    const gridHeight =
      data.length * rowHeight + (loadingMoreData ? rowHeight * 2 : 0);

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
            <div style={{ width: gridMeta.leftWidth }} className="grid-left">
              <div className="grid-left-body">
                {leftGrid}
                {loadingMoreData && (
                  <PartialLoader
                    style={{
                      transform: `translateY(${this.getTopPosition(
                        data.length
                      )}px)`,
                    }}
                    schema={gridMeta.leftSchema}
                    className="partial-loader"
                    rowStyle={{ height: rowHeight }}
                  />
                )}
              </div>
            </div>
            {/*
             * Center Grid
             */}
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
                        transform: `translateY(${this.getTopPosition(
                          data.length
                        )}px)`,
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
            className="grid-scroll-center"
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
