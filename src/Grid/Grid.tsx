import * as React from 'react';
import memoize from 'fast-memoize';

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
  start: number;
  end: number;
  position: number;
  visibleCount: number;
}

class Grid extends React.PureComponent<IProps, IState> {
  // Refs
  centerGridRef: React.RefObject<HTMLDivElement> = React.createRef();
  centerScrollRef: React.RefObject<HTMLDivElement> = React.createRef();
  centerHeaderRef: React.RefObject<HTMLDivElement> = React.createRef();
  gridRef: React.RefObject<HTMLDivElement> = React.createRef();

  // Grid metadata
  leftSchema: ISchema[];
  centerSchema: ISchema[];
  leftWidth: number;
  centerWidth: number;

  // Load more metadata
  loadMoreDataPosition = {
    position: -1,
    end: -1,
  };

  public static defaultProps = {
    buffer: 25,
  };

  constructor(props: IProps) {
    super(props);
    this.state = {
      start: 0,
      end: -1,
      position: 0,
      visibleCount: -1,
    };

    this.leftSchema = props.schema.filter(({ pinned }) => pinned === 'LEFT');
    this.centerSchema = props.schema.filter(({ pinned }) => !pinned);

    this.leftWidth = this.leftSchema.reduce(
      (total, current) => (total = total + current.width),
      0
    );

    this.centerWidth = this.centerSchema.reduce(
      (total, current) => (total = total + current.width),
      0
    );
  }

  componentDidMount() {
    const { rowHeight, buffer } = this.props;

    const visibleCount = this.gridRef.current
      ? Math.round(this.gridRef.current.offsetHeight / rowHeight)
      : 0;

    this.setState({
      end: visibleCount + buffer!,
      visibleCount,
    });
  }
  componentDidUpdate(prevProps: IProps) {
    // If data length changes at any point, ideally it will
    // be after getting more data
    // calculate start, end and re-render
    // so if user is at the bottom of table and waiting for more
    // data, rows after previous data.length will render
    if (
      prevProps.data.length !== this.props.data.length &&
      this.gridRef.current
    ) {
      const { rowHeight, buffer, data } = this.props;
      const { visibleCount } = this.state;

      const currentPosition = Math.round(
        this.gridRef.current.scrollTop / rowHeight
      );

      this.handleCurrentBuffer({
        currentPosition,
        buffer: buffer,
        position: -visibleCount,
        visibleCount: visibleCount,
        dataLength: data.length,
      });
    }
  }

  // TODO: add proper types for scroll events
  syncHorizontalScroll = (event: any) => {
    const scrollLeft = event.target.scrollLeft;
    if (this.centerGridRef.current) {
      this.centerGridRef.current.scrollLeft = scrollLeft;
    }
    if (this.centerScrollRef.current) {
      this.centerScrollRef.current.scrollLeft = scrollLeft;
    }
    if (this.centerHeaderRef.current) {
      this.centerHeaderRef.current.scrollLeft = scrollLeft;
    }
  };

  handleGridScroll = (event: any) => {
    if (event.target !== this.gridRef.current) {
      return;
    }
    const scrollTop = event.target.scrollTop;
    const { rowHeight, buffer, data } = this.props;
    const { position, visibleCount } = this.state;
    const currentPosition = Math.round(scrollTop / rowHeight);

    this.handleCurrentBuffer({
      currentPosition,
      buffer,
      position,
      visibleCount,
      dataLength: data.length,
    });

    this.loadMoreData(currentPosition, visibleCount, data.length);
  };

  handleCurrentBuffer = ({
    currentPosition,
    visibleCount,
    position,
    buffer,
    dataLength,
  }: {
    currentPosition: number;
    visibleCount: number;
    position: number;
    buffer: number;
    dataLength: number;
  }) => {
    if (Math.abs(currentPosition - position) >= visibleCount) {
      this.setState(({ visibleCount }) => ({
        start: Math.max(currentPosition - visibleCount - buffer!, 0),
        end: Math.min(currentPosition + visibleCount + buffer!, dataLength - 1),
        position: currentPosition,
      }));
    }
  };

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

  memoizedGetVirtualList = memoize(
    (
      start: number,
      end: number,
      schema: IProps['schema'],
      data: IProps['data'],
      rowHeight: IProps['rowHeight']
    ) => {
      const rows = [];
      for (let index = start; index <= end; index++) {
        if (index === data.length) {
          break;
        }
        const row = data[index];
        rows.push(
          <div
            data-row={index}
            style={{
              width: '100%',
              height: rowHeight,
              transform: `translateY(${this.getTopPosition(index)}px)`,
            }}
            className="row"
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
      }

      return rows;
    }
  );

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
    const { start, end, visibleCount } = this.state;

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
        <div {...girdRestProps}>
          <Loader
            rows={visibleCount > 0 ? visibleCount + 1 : undefined}
            rowHeight={rowHeight}
          />
        </div>
      );
    }

    if (showOverlay) {
      return <div {...girdRestProps}>{overlay}</div>;
    }

    const leftGrid = this.memoizedGetVirtualList(
      start,
      end,
      this.leftSchema,
      data,
      rowHeight
    );
    const centerGrid = this.memoizedGetVirtualList(
      start,
      end,
      this.centerSchema,
      data,
      rowHeight
    );

    const gridHeight =
      data.length * rowHeight + (loadingMoreData ? rowHeight * 2 : 0);

    return (
      <div {...girdRestProps}>
        <Header
          getRef={this.getHeaderRef}
          centerSchema={this.centerSchema}
          leftSchema={this.leftSchema}
          centerWidth={this.centerWidth}
          leftWidth={this.leftWidth}
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
            <div style={{ width: this.leftWidth }} className="grid-left">
              <div className="grid-left-body">
                {leftGrid}
                {loadingMoreData && (
                  <PartialLoader
                    style={{
                      transform: `translateY(${this.getTopPosition(
                        data.length
                      )}px)`,
                    }}
                    schema={this.leftSchema}
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
              style={{ width: `calc(100% - ${this.leftWidth}px)` }}
              className="grid-center"
            >
              <div
                ref={this.centerGridRef}
                className="grid-center-body hide-scroll-bar"
                onScroll={this.syncHorizontalScroll}
              >
                <div
                  style={{ width: this.centerWidth }}
                  className="grid-center-body-inner"
                >
                  {centerGrid}
                  {loadingMoreData && (
                    <PartialLoader
                      schema={this.centerSchema}
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
          <div className="grid-scroll-left" style={{ width: this.leftWidth }} />
          <div
            style={{
              width: `calc(100% - ${this.leftWidth}px)`,
            }}
            className="grid-scroll-center"
            ref={this.centerScrollRef}
            onScroll={this.syncHorizontalScroll}
          >
            <div style={{ width: this.centerWidth }} />
          </div>
        </div>
      </div>
    );
  }
}

export default Grid;
