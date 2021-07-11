import * as React from 'react';
import { useGrids } from '../../grid';
import { sampleSize, random } from 'lodash-es';

import './pinned.css';

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
    lastName: sampleSize(randomString, random(1, 5)).join(' '),
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
  const {
    onScroll,
    rowRenderers,
    tableHeight,
    tableRef,
    actions,
    GridHeaders,
    GridBodies,
  } = useGrids(3, {
    data: loading.current ? data.concat([null, null]) : data,
    rowHeight: rowHeight || 39,
    buffer,
    limit,
    dynamicHeight: true,
    loadMore: getData,
  });
  const offset = React.useRef(0);

  // @ts-ignore
  window.tableX = { actions };

  return (
    <div className="App">
      <div
        className="table-header-wrapper"
        style={{
          border: '1px solid red',
          overflow: 'hidden',
        }}
      >
        {[0, 1, 2].map((i) => {
          const GridHeader = GridHeaders[i];
          return (
            <GridHeader
              key={i}
              className="table-header"
              style={{
                width: i !== 1 ? 100 : 'auto',
                overflowX: 'auto',
                flexShrink: i !== 1 ? 0 : undefined,
              }}
            >
              {i !== 1 && <div className="table-header-cell">First Name</div>}
              {i === 1 && (
                <>
                  <div className="table-header-cell">Last Name</div>
                  <div className="table-header-cell">Age</div>
                  <div className="table-header-cell">Last Name</div>
                  <div className="table-header-cell">Age</div>
                  <div className="table-header-cell">Last Name</div>
                  <div className="table-header-cell">Age</div>
                  <div className="table-header-cell">Last Name</div>
                  <div className="table-header-cell">Age</div>
                  <div className="table-header-cell">Last Name</div>
                  <div className="table-header-cell">Age</div>
                  <div className="table-header-cell">Last Name</div>
                  <div className="table-header-cell">Age</div>
                </>
              )}
            </GridHeader>
          );
        })}
      </div>

      <div
        onScroll={onScroll}
        ref={tableRef}
        className="table-body-container"
        style={{
          display: 'flex',
          height: 480,
          overflowY: 'auto',
          overflowX: 'hidden',
          border: '1px solid red',
        }}
      >
        {rowRenderers.map((rowRenderer, i) => {
          const GridBody = GridBodies[i];
          return (
            <GridBody
              className="table-body-wrapper"
              key={i}
              style={{
                position: 'relative',
                flexShrink: 0,
                overflowX: 'auto',
                overflowY: 'hidden',

                height: tableHeight + (loading.current ? 2 * 39 : 0),
                flexGrow: i === 1 ? 2 : undefined,
              }}
            >
              <div
                className="table-body"
                style={{ position: 'relative', width: i !== 1 ? 100 : 'auto' }}
              >
                {rowRenderer((row, style, index, ref) =>
                  row ? (
                    <div
                      ref={ref}
                      className="table-row"
                      data-testid={`table-row-${index}`}
                      style={style}
                      key={index}
                    >
                      {(i === 0 || i === 2) && (
                        <div className="table-row-cell">
                          {index}:{row.firstName}
                        </div>
                      )}
                      {i === 1 && (
                        <>
                          <div className="table-row-cell">
                            {index}: {row.lastName}
                          </div>
                          <div className="table-row-cell">{row.age}</div>
                          <div className="table-row-cell">
                            {index}: {row.lastName}
                          </div>
                          <div className="table-row-cell">{row.age}</div>
                          <div className="table-row-cell">
                            {index}: {row.lastName}
                          </div>
                          <div className="table-row-cell">{row.age}</div>
                          <div className="table-row-cell">
                            {index}: {row.lastName}
                          </div>
                          <div className="table-row-cell">{row.age}</div>
                          <div className="table-row-cell">
                            {index}: {row.lastName}
                          </div>
                          <div className="table-row-cell">{row.age}</div>
                          <div className="table-row-cell">
                            {index}: {row.lastName}
                          </div>
                          <div className="table-row-cell">{row.age}</div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div
                      ref={ref}
                      className="table-row"
                      data-testid={`table-row-${index}`}
                      style={style}
                      key={index}
                    >
                      <div>Loading</div>
                    </div>
                  )
                )}
              </div>
            </GridBody>
          );
        })}
      </div>
    </div>
  );
};

export default Table;
