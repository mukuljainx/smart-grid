import * as React from 'react';
import memoize from 'fast-memoize';

import './grid.scss';
import Cell from './Cell';
import Loader from './Loader';

export interface ISchema {
  width: number;
  template: React.ElementType;
  pinned?: 'LEFT';
  get: (props: ObjectLiteral) => ObjectLiteral;
}

export interface ObjectLiteral {
  [k: string]: any;
}

export interface IProps {
  data: ObjectLiteral[];
  schema: ISchema[];
  rowHeight: number;
  style: React.CSSProperties;
  loadMore?: () => void;
  buffer?: number;
  loading?: boolean;
  /**
   * This will render if loading is true
   * parent element will gird's first div
   */
  loader?: React.ReactChild;
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

  syncHorizontalScroll = (event: any) => {
    const scrollLeft = event.target.scrollLeft;
    if (this.centerGridRef.current) {
      this.centerGridRef.current.scrollLeft = scrollLeft;
    }
    if (this.centerScrollRef.current) {
      this.centerScrollRef.current.scrollLeft = scrollLeft;
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
    if (Math.abs(currentPosition - position) >= visibleCount) {
      this.setState(({ visibleCount }) => ({
        start: Math.max(currentPosition - visibleCount - buffer!, 0),
        end: Math.min(
          currentPosition + visibleCount + buffer!,
          data.length - 1
        ),
        position: currentPosition,
      }));
    }

    this.loadMoreData(currentPosition, visibleCount, data.length);
  };

  loadMoreData = (
    currentPosition: number,
    visibleCount: number,
    rows: number
  ) => {
    if (
      currentPosition > this.loadMoreDataPosition.position &&
      rows > this.loadMoreDataPosition.end &&
      currentPosition > rows - 1.5 * visibleCount
    ) {
      if (this.props.loadMore) {
        this.props.loadMore();
      }
      this.loadMoreDataPosition = {
        position: currentPosition,
        end: rows,
      };
    }
  };

  getVirtualList = (start: number, end: number, schema: IProps['schema']) => {
    const { data, rowHeight } = this.props;
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
            height: rowHeight,
            transform: `translateY(${index * rowHeight}px)`,
          }}
          className="row"
          key={index}
        >
          {schema.map(({ width, template, get }, j) => (
            <Cell key={j} width={width} template={template} {...get(row)} />
          ))}
        </div>
      );
    }

    return rows;
  };

  memoizedGetVirtualList = memoize(this.getVirtualList);

  render() {
    const {
      data,
      rowHeight,
      loading,
      style,
      loader,
      overlay,
      showOverlay,
    } = this.props;
    const { start, end, visibleCount } = this.state;

    if (visibleCount === -1) {
      return (
        <div ref={this.gridRef} style={this.props.style}>
          Loading No Mounted yet
        </div>
      );
    }

    if (visibleCount > -1 && data.length === 0) {
      return (
        <div style={{ height: 100 }} ref={this.gridRef}>
          Loading No Data yet
        </div>
      );
    }

    if (loading) {
      if (loader) {
        return loader;
      }
      return (
        <div className="craft-smart-grid" style={style}>
          <Loader
            rows={visibleCount > 0 ? visibleCount + 1 : undefined}
            rowHeight={rowHeight}
          />
        </div>
      );
    }

    if (showOverlay) {
      return (
        <div className="craft-smart-grid" style={style}>
          {overlay}
        </div>
      );
    }

    const leftGrid = this.memoizedGetVirtualList(start, end, this.leftSchema);
    const centerGrid = this.memoizedGetVirtualList(
      start,
      end,
      this.centerSchema
    );

    return (
      <div className="craft-smart-grid" style={this.props.style}>
        <div
          className="grid"
          ref={this.gridRef}
          onScroll={this.handleGridScroll}
        >
          <div
            style={{ height: data.length * rowHeight }}
            className="grid-body"
          >
            <div style={{ width: this.leftWidth }} className="grid-left">
              <div className="grid-left-body">{leftGrid}</div>
            </div>
            <div
              style={{ width: `calc(100% - ${this.leftWidth}px)` }}
              className="grid-center"
            >
              <div
                ref={this.centerGridRef}
                className="grid-center-body"
                onScroll={this.syncHorizontalScroll}
              >
                <div
                  style={{ width: this.centerWidth }}
                  className="grid-center-body-inner"
                >
                  {centerGrid}
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
