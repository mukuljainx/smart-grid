import * as React from 'react';
import { IGridProps } from '../interface';
import { useGrids } from '../index';

type IDivProps = JSX.IntrinsicElements['div'];

interface IProps extends IDivProps {
  headerHeight: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: IGridProps<any>;
  count: number;
  headers: React.ReactNode[];
  rows: ReturnType<typeof useGrids>['rowRenderers'];
}

const MultiGrid = ({
  options,
  headerHeight,
  count,
  headers,
  rows,
  ...rest
}: IProps) => {
  const {
    onScroll,
    rowRenderers,
    tableHeight,
    tableRef,
    GridHeaders,
    GridBodies,
    ScrollBars,
  } = useGrids(count, options);
  return (
    <div {...rest}>
      {GridHeaders.map((GridHeader, i) => {
        return (
          <GridHeader
            key={i}
            className="table-header"
            style={{
              width: styles[i].width,
              flexShrink: styles[i].flexShrink,
              overflow: 'auto',
            }}
          >
            {headers[i]}
          </GridHeader>
        );
      })}
    </div>
  );
};

export default MultiGrid;
