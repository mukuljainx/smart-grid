import * as React from 'react';
// import { useGrid } from '@crafts/smart-grid';
import { useGrid } from '../../grid';
import users from '../users';
import './basic.css';

const generateData = (offset = 0) => users.slice(offset, offset + 100);

const api = (offset: number) =>
  new Promise<any>((res) => {
    setTimeout(() => {
      res(generateData(offset));
    }, 1200);
  });

interface IProps {
  rowHeight?: number;
  buffer?: number;
  limit?: number;
  virtualized?: boolean;
}

const Table = ({ rowHeight, buffer, limit, virtualized = true }: IProps) => {
  const [state, setState] = React.useState({
    data: generateData(),
    loading: false,
  });
  const offset = React.useRef(0);

  const getData = React.useCallback(
    (sp: number) => {
      if (state.loading || offset.current >= 1000) {
        return;
      }

      setState((s) => ({ ...s, loading: true }));
      offset.current += 100;
      api(offset.current).then((newD) => {
        // setData((d) => [...d, ...newD]);
        setState((s) => ({ data: [...s.data, ...newD], loading: false }));
      });
    },
    [state.loading]
  );

  const { onScroll, tableRenderer, tableHeight } = useGrid({
    data: state.loading ? state.data.concat([null, null]) : state.data,
    rowHeight: rowHeight || 39,
    buffer,
    limit,
    loadMore: getData,
    virtualized,
  });

  return (
    <div className="table-wrapper">
      <table role="table">
        <thead>
          <tr role="row">
            <th role="cell" colSpan={4}></th>
            <th role="cell" colSpan={3}>
              Car
            </th>
          </tr>
          <tr role="row">
            <th colSpan={1} role="cell">
              First Name
            </th>
            <th colSpan={1} role="cell">
              Last Name
            </th>
            <th colSpan={1} role="cell">
              Age
            </th>
            <th colSpan={1} role="cell">
              Email
            </th>
            <th colSpan={1} role="cell">
              Make
            </th>
            <th colSpan={1} role="cell">
              Model
            </th>
            <th colSpan={1} role="cell">
              Year
            </th>
          </tr>
        </thead>
        <tbody
          // style={{ minHeight: tableHeight }}
          role="rowgroup"
          onScroll={onScroll}
        >
          {tableRenderer((row, style, index, ref) =>
            row ? (
              <tr
                role="row"
                ref={ref}
                className="table-row"
                data-testid={`table-row-${index}`}
                style={style}
                key={index}
              >
                <td role="cell">{row.firstName}</td>
                <td role="cell">{row.lastName}</td>
                <td role="cell">{row.age}</td>
                <td role="cell">{row.email}</td>
                <td role="cell">{row.carMake}</td>
                <td role="cell">{row.carModel}</td>
                <td role="cell">{row.carYear}</td>
              </tr>
            ) : (
              <tr
                ref={ref}
                className="table-row loading"
                data-testid={`table-row-${index}`}
                style={style}
                key={index}
              >
                <td role="cell">Loading</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
