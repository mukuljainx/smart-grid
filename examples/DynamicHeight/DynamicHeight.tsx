import * as React from 'react';
import { useGrid } from '@crafts/smart-grid';
import users from './users';
import './dynamic.css';
import { sampleSize, random, map } from 'lodash-es';

const noteArray = [
  'Mountain',
  'Big',
  'Break',
  'Bike',
  'Rocket',
  'New',
  'Hello',
  'Sea',
  'Can',
  'Fly',
  'Bird',
  'Code',
  'Bye',
];

const getRandomNote = () => sampleSize(noteArray, random(1, 5)).join(' ');

const generateData = (offset = 0) =>
  users.slice(offset, offset + 100).map((row) => ({
    ...row,
    note: getRandomNote(),
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
  virtualized?: boolean;
}

const DynamicHeight = ({
  rowHeight,
  buffer,
  limit,
  virtualized = true,
}: IProps) => {
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

  const { onScroll, rowRenderer, tableHeight, tableRef, actions } = useGrid({
    data: state.loading ? state.data.concat([null, null]) : state.data,
    rowHeight: rowHeight || 39,
    buffer,
    limit,
    loadMore: getData,
    virtualized,
    dynamicHeight: true,
  });

  const randomizeNote = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const id = parseInt(
        (event.target as HTMLElement).getAttribute('data-button-id'),
        10
      );
      setState((s) => ({
        loading: false,
        data: s.data.map((row, i) =>
          i === id ? { ...row, note: getRandomNote() } : row
        ),
      }));
      actions.clear(id);
    },
    []
  );

  return (
    <div className="table-wrapper">
      <p>
        This calculates height for each row using refs and if any cell height
        changes due any reason like here on click of randomize, you can trigger
        a re-calculation of height using actions from use Grid. Like
        actions.clear(rowIndex);
      </p>
      <div className="table" role="table">
        <div className="table-header" role="row">
          <div className="table-header-cell" role="cell">
            First Name
          </div>
          <div className="table-header-cell" role="cell">
            Last Name
          </div>
          <div className="table-header-cell" role="cell">
            Age
          </div>
          <div className="table-header-cell" role="cell">
            Email
          </div>
          <div className="table-header-cell" role="cell">
            Note
          </div>
          <div className="table-header-cell" role="cell">
            Action
          </div>
        </div>

        <div className="table-body-wrapper" ref={tableRef} onScroll={onScroll}>
          <div className="table-body" style={{ height: tableHeight }}>
            {rowRenderer((row, style, index, ref) =>
              row ? (
                <div
                  role="row"
                  ref={ref}
                  className="table-row"
                  data-testid={`table-row-${index}`}
                  style={style}
                  key={index}
                >
                  <div className="table-row-cell ellipsis" role="cell">
                    {row.firstName}
                  </div>
                  <div className="table-row-cell ellipsis" role="cell">
                    {row.lastName}
                  </div>
                  <div className="table-row-cell ellipsis" role="cell">
                    {row.age}
                  </div>
                  <div className="table-row-cell ellipsis" role="cell">
                    {row.email}
                  </div>
                  <div className="table-row-cell" role="cell">
                    {row.note}
                  </div>
                  <div className="table-row-cell" role="cell">
                    <button data-button-id={index} onClick={randomizeNote}>
                      Random
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  ref={ref}
                  className="table-row loading"
                  data-testid={`table-row-${index}`}
                  style={style}
                  key={index}
                >
                  <div className="table-row-cell" role="cell">
                    Loading
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicHeight;
