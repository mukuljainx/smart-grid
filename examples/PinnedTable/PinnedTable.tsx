import * as React from 'react';
import { useGrids } from '@crafts/smart-grid';
import users from './users';

import './pinned.css';

const generateData = (offset = 0) => users.slice(offset, offset + 100);

const api = (offset: number) =>
  new Promise<ReturnType<typeof generateData>>((res) => {
    setTimeout(() => {
      res(generateData(offset));
    }, 800);
  });

interface IProps {
  rowHeight?: number;
  buffer?: number;
  limit?: number;
}

const styles: Record<string, React.CSSProperties[]> = {
  header: [
    { width: 100, overflowX: 'auto', flexShrink: 0 },
    { width: 700, overflowX: 'auto' },
    { width: 100, overflowX: 'auto', flexShrink: 0 },
  ],
  bodyWrapper: [
    {},
    {
      flexGrow: 2,
    },
    {},
  ],
  body: [{ width: 100 }, {}, { width: 100 }],
};

const schema = {
  header: [
    () => <div className="table-header-cell grid-1">ID</div>,
    () => (
      <>
        <div className="table-header-cell grid-2">First Name</div>
        <div className="table-header-cell grid-2">Last Name</div>
        <div className="table-header-cell grid-2">Age</div>
        <div className="table-header-cell grid-2">Email</div>
        <div className="table-header-cell grid-2">Make</div>
        <div className="table-header-cell grid-2">Model</div>
        <div className="table-header-cell grid-2">Year</div>
      </>
    ),
    () => <div className="table-header-cell grid-3">ID</div>,
  ],
  body: [
    (row) => <div className="table-row-cell grid-1">{row.id}</div>,
    (row) => (
      <>
        <div className="table-row-cell grid-2 ellipsis">{row.firstName}</div>
        <div className="table-row-cell grid-2 ellipsis">{row.lastName}</div>
        <div className="table-row-cell grid-2 ellipsis">{row.age}</div>
        <div className="table-row-cell grid-2 ellipsis">{row.email}</div>
        <div className="table-row-cell grid-2 ellipsis">{row.carMake}</div>
        <div className="table-row-cell grid-2 ellipsis">{row.carModel}</div>
        <div className="table-row-cell grid-2 ellipsis">{row.carYear}</div>
      </>
    ),
    (row) => <div className="table-row-cell grid-3">{row.id}</div>,
  ],
};

const Table = ({ rowHeight, buffer, limit }: IProps) => {
  const [data, setData] = React.useState(generateData());
  // const [loading, setLoading] = React.useState(false);
  const loading = React.useRef(false);
  const getData = React.useCallback(() => {
    if (loading.current) {
      return;
    }
    loading.current = true;
    offset.current += 100;
    api(offset.current).then((newD) => {
      setData((d) => [...d, ...newD]);
      loading.current = false;
    });
  }, [loading]);
  const {
    onScroll,
    rowRenderers,
    tableHeight,
    tableRef,
    GridHeaders,
    GridBodies,
    ScrollBars,
  } = useGrids(3, {
    data: loading.current ? data.concat([null, null]) : data,
    rowHeight: rowHeight || 39,
    buffer,
    limit,
    dynamicHeight: true,
    loadMore: getData,
  });
  const offset = React.useRef(0);

  return (
    <div className="App">
      <div className="table">
        <div
          className="table-header-wrapper"
          style={{
            // border: '1px solid red',
            overflow: 'hidden',
          }}
        >
          {GridHeaders.map((GridHeader, i) => {
            const H = schema['header'][i];
            return (
              <GridHeader
                key={i}
                className="table-header"
                style={styles['header'][i]}
              >
                <H />
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
            overflowY: 'auto',
            overflowX: 'hidden',
            // border: '1px solid red',
          }}
        >
          {schema.body.map((_, i) => {
            const GridBody = GridBodies[i];
            const Body = schema.body[i];
            const rowRenderer = rowRenderers[i];
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
                  ...styles['bodyWrapper'][i],
                }}
              >
                <div
                  className="table-body"
                  style={{
                    position: 'relative',
                    ...styles['body'][i],
                  }}
                >
                  {rowRenderer((row, style, index, ref) => {
                    return row ? (
                      <div
                        ref={ref}
                        className="table-row"
                        data-testid={`table-row-${index}`}
                        style={style as React.CSSProperties}
                        key={index}
                      >
                        <Body {...row} />
                      </div>
                    ) : (
                      <div
                        ref={ref}
                        className="table-row"
                        data-testid={`table-row-${index}`}
                        style={
                          {
                            ...style,
                            width: styles['header'][i].width,
                          } as React.CSSProperties
                        }
                        key={index}
                      >
                        <div
                          style={{ width: '100%', textAlign: 'left' }}
                          className={`grid-${i + 1}`}
                        >
                          Loading
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GridBody>
            );
          })}
        </div>
        <div className="who-am-i">
          {ScrollBars.map((ScrollBar, i) => (
            <ScrollBar
              key={i}
              style={{ overflowX: 'auto', flexShrink: i === 1 ? undefined : 0 }}
            >
              <div
                style={{
                  width: styles['header'][i].width,
                  height: '100%',
                }}
              ></div>
            </ScrollBar>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Table;
