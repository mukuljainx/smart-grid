import * as React from 'react';
import { useTable } from '@crafts/smart-grid';
import users from './users';
import './basic.css';

const generateData = (offset = 0) => users.slice(offset, offset + 100);

const api = (offset: number) =>
  new Promise<any>((res) => {
    setTimeout(() => {
      console.log(generateData(offset));
      res(generateData(offset));
    }, 1200);
  });

interface IProps {
  rowHeight?: number;
  buffer?: number;
  limit?: number;
}

const Table = ({ rowHeight, buffer, limit }: IProps) => {
  const [data, setData] = React.useState(generateData());
  const loading = React.useRef(false);
  const getData = React.useCallback(
    (sp: number) => {
      console.log(sp, loading.current);
      if (loading.current) {
        return;
      }
      console.log('CALL');
      loading.current = true;
      offset.current += 100;
      api(offset.current).then((newD) => {
        setData((d) => [...d, ...newD]);
        loading.current = false;
      });
    },
    [loading]
  );
  const { onScroll, tableRenderer } = useTable({
    totalCount: data.length + (loading.current ? 2 : 0),
    rowHeight: rowHeight || 39,
    buffer,
    limit,
    loadMore: getData,
  });
  const offset = React.useRef(0);

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
        <tbody role="rowgroup" onScroll={onScroll}>
          {tableRenderer(
            loading.current ? data.concat([null, null]) : data,
            (row, style, index, ref) =>
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
