import * as React from 'react';

import './loader.scss';

interface IProps {
  rows?: number;
  rowHeight?: number;
}

export const Placeholder = ({
  style,
  shimmerWidth,
}: {
  /**
   *  Column width is mandatory for proper rendering
   */
  style: React.CSSProperties;
  shimmerWidth: React.CSSProperties['width'];
}) => (
  <div className="loader-column" style={style}>
    <div className="shimmer" style={{ width: shimmerWidth }}></div>
  </div>
);

class Loader extends React.PureComponent<IProps> {
  columns: string[] = [
    '4%',
    '4%',
    '14%',
    '13%',
    '11%',
    '7%',
    '9%',
    '14%',
    '11%',
    '13%',
  ];

  getLoaderRows = (rows: number, height: number) => {
    const list = new Array(rows).fill(0);
    return list.map((_, i) => (
      <div className="loader-row" key={i} style={{ height }}>
        {this.columns.map((width, j) => {
          const shimmerWidth = j > 1 ? (5 + Math.random() * 5) * 10 : 100;

          return (
            <Placeholder
              key={j}
              shimmerWidth={shimmerWidth}
              style={{ width }}
            />
          );
        })}
      </div>
    ));
  };

  render() {
    const { rows, rowHeight } = this.props;

    return (
      <div className="loader-wrapper">
        {this.getLoaderRows(rows!, rowHeight!)}
      </div>
    );
  }

  static defaultProps = {
    rowHeight: 40,
    rows: 20,
  };
}

export default Loader;
