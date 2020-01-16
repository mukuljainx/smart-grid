import * as React from "react";
import "./table.css";
import Cell from "./Cell";
import memoize from "fast-memoize";

export interface ISchema {
  width: number;
  template: React.ElementType;
  pinned?: "LEFT";
  get: (props: ObjectLiteral) => ObjectLiteral;
}

export interface ObjectLiteral {
  [k: string]: any;
}

interface IProps {
  schema: ISchema[];
  rowHeight: number;
  buffer?: number;
  data: ObjectLiteral[];
  loadMore?: () => void;
  style: React.CSSProperties;
  loading?: boolean;
  partialLoading?: boolean;
}

interface IState {
  start: number;
  end: number;
  position: number;
  visibleCount: number;
}

class Table extends React.PureComponent<IProps, IState> {
  // Refs
  centerTableRef: React.RefObject<HTMLDivElement> = React.createRef();
  centerScrollRef: React.RefObject<HTMLDivElement> = React.createRef();
  tableRef: React.RefObject<HTMLDivElement> = React.createRef();

  // Table metadata
  leftSchema: ISchema[];
  centerSchema: ISchema[];
  leftWidth: number;
  centerWidth: number;

  // Load more metadata
  loadMoreDataPosition = {
    position: -1,
    end: -1
  };

  public static defaultProps = {
    buffer: 25
  };

  constructor(props: IProps) {
    super(props);
    this.state = {
      start: 0,
      end: -1,
      position: 0,
      visibleCount: -1
    };

    this.leftSchema = props.schema.filter(({ pinned }) => pinned === "LEFT");
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

    const visibleCount = this.tableRef.current
      ? Math.round(this.tableRef.current.offsetHeight / rowHeight)
      : 0;

    this.setState({
      end: visibleCount + buffer!,
      visibleCount
    });
  }

  syncHorizontalScroll = (event: any) => {
    const scrollLeft = event.target.scrollLeft;
    if (this.centerTableRef.current) {
      this.centerTableRef.current.scrollLeft = scrollLeft;
    }
    if (this.centerScrollRef.current) {
      this.centerScrollRef.current.scrollLeft = scrollLeft;
    }
  };

  handleTableScroll = (event: any) => {
    if (event.target !== this.tableRef.current) {
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
        position: currentPosition
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
        end: rows
      };
    }
  };

  getVirtualList = (start: number, end: number, schema: IProps["schema"]) => {
    const { data, rowHeight } = this.props;
    const table = [];
    for (let index = start; index <= end; index++) {
      if (index === data.length) {
        break;
      }
      const row = data[index];
      table.push(
        <div
          data-row={index}
          style={{
            height: rowHeight,
            transform: `translateY(${index * rowHeight}px)`
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

    return table;
  };

  memoizedGetVirtualList = memoize(this.getVirtualList);

  render() {
    if (this.state.visibleCount === -1) {
      return (
        <div ref={this.tableRef} style={this.props.style}>
          Loading No Mounted yet
        </div>
      );
    }

    if (this.state.visibleCount > -1 && this.props.data.length === 0) {
      return (
        <div style={{ height: 100 }} ref={this.tableRef}>
          Loading No Data yet
        </div>
      );
    }

    if (this.props.loading) {
      console.log("Loading");
    }

    const { data, rowHeight } = this.props;
    const { start, end } = this.state;
    const leftTable = this.memoizedGetVirtualList(start, end, this.leftSchema);
    const centerTable = this.memoizedGetVirtualList(
      start,
      end,
      this.centerSchema
    );

    return (
      <div className="table-wrapper" style={this.props.style}>
        <div
          className="table"
          ref={this.tableRef}
          onScroll={this.handleTableScroll}
        >
          <div
            style={{ height: data.length * rowHeight }}
            className="table-body"
          >
            <div style={{ width: this.leftWidth }} className="table-left">
              <div className="table-left-body">{leftTable}</div>
            </div>
            <div
              style={{ width: `calc(100% - ${this.leftWidth}px)` }}
              className="table-center"
            >
              <div
                ref={this.centerTableRef}
                className="table-center-body"
                onScroll={this.syncHorizontalScroll}
              >
                <div
                  style={{ width: this.centerWidth }}
                  className="table-center-body-inner"
                >
                  {centerTable}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="table-scroll">
          <div
            className="table-scroll-left"
            style={{ width: this.leftWidth }}
          />
          <div
            style={{
              width: `calc(100% - ${this.leftWidth}px)`
            }}
            className="table-scroll-center"
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

export default Table;
