import * as React from 'react';
import { IProps as IGridProps } from '../Grid';

interface IProps {
  index: number;
  calculatedRowHeight: number[];
  getTopPosition: (index: number) => number;
  dynamicRowHeight: IGridProps['dynamicRowHeight'];
  rowHeight: IGridProps['rowHeight'];
  row: IGridProps['data'][0];
}

class Row extends React.PureComponent<IProps> {
  render() {
    const {
      dynamicRowHeight,
      calculatedRowHeight,
      rowHeight,
      getTopPosition,
      index,
      row,
      children,
    } = this.props;
    return (
      <div
        data-row={index}
        style={{
          width: '100%',
          height: dynamicRowHeight ? calculatedRowHeight[index] : rowHeight,
          transform: `translateY(${getTopPosition(index)}px)`,
        }}
        className={`row ${row.className || ''}`}
        key={index}
      >
        {children}
      </div>
    );
  }
}

export default Row;
