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

const data = new Array(1000).fill(0).map((_, i) => ({
  firstName: sampleSize(randomString, random(1, 5)).join(' '),
  lastName: `React ${i}`,
  age: `2${i}`,
}));

interface IProps {
  rowHeight?: number;
  buffer?: number;
  limit?: number;
}

const Table = ({ rowHeight, buffer, limit }: IProps) => {
  const { onScroll, virtualizedRows } = useVirtualization({
    totalCount: data.length,
    rowHeight: rowHeight || 39,
    buffer,
    limit,
    dynamicHeight: true,
  });
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
          {virtualizedRows(data, (row, style, index, ref) => (
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
