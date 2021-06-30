import * as React from 'react';
import useVirtualization from '../Grid/hooks/useVirtualization';
import { sampleSize, random } from 'lodash';

const randomString = [
  'Montain',
  'Heavy',
  'bike',
  'car',
  'broken',
  'all',
  'of',
  'me',
  'dance',
  'kick',
];

const generateData = (offset = 0) =>
  new Array(100).fill(0).map((_, i) => ({
    firstName: sampleSize(randomString, random(1, 5)).join(' '),
    lastName: `React ${i + offset}`,
    age: `2${i + offset}`,
  }));

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
}

const Table = ({ rowHeight, buffer, limit }: IProps) => {
  const [data, setData] = React.useState(generateData());
  // const [loading, setLoading] = React.useState(false);
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
  const { onScroll, virtualizedRows } = useVirtualization({
    totalCount: data.length + (loading.current ? 2 : 0),
    rowHeight: rowHeight || 39,
    buffer,
    limit,
    dynamicHeight: true,
    loadMore: getData,
  });
  const offset = React.useRef(0);

  console.log('TABLE');

  return (
    <div className="App">
      <table style={{ height: 200, overflow: 'hidden' }}>
        <thead>
          <tr>
            <th>Firstname</th>
            <th>Lastname</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody
          onScroll={onScroll}
          style={{ overflow: 'auto', position: 'relative' }}
        >
          {virtualizedRows(
            loading.current ? data.concat([null, null]) : data,
            (row, style, index, ref) =>
              row ? (
                <tr
                  ref={ref}
                  className="table-row"
                  data-testid={`table-row-${index}`}
                  style={style}
                  key={index}
                >
                  <td>{row.firstName}</td>
                  <td>{row.lastName}</td>
                  <td>{row.age}</td>
                </tr>
              ) : (
                <tr
                  ref={ref}
                  className="table-row"
                  data-testid={`table-row-${index}`}
                  style={style}
                  key={index}
                >
                  Loading
                </tr>
              )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
