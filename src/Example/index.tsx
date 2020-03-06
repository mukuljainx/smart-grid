import * as React from 'react';
import { range, random } from 'lodash-es';
import produce from 'immer';

import Grid, { ISchema } from '../Grid';

type SimpleObject = Record<string, any>;

const note = `Pepper Potts as his oxygen supply starts to dwindle.`;

const notes: Record<number, string> = {};
range(10000).forEach((index: number) => {
  notes[index] = note.substr(0, random(20, note.length));
});

const getData = (limit: number) =>
  range(limit).map(i => ({
    a: `a ${i + 1}`,
    b: `b ${i + 1}`,
    c: `c ${i + 1}`,
    d: `d ${i + 1}`,
    e: `e ${i + 1}`,
    logo:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Sketch_Logo.svg/1133px-Sketch_Logo.svg.png',
    checked: false,
    note: notes[i],
  }));

let limit = 0;

interface IState {
  loading: boolean;
  data: ReturnType<typeof getData>;
  allChecked: boolean;
}

export default class App extends React.Component<{}, IState> {
  state: IState = {
    data: [] as any,
    loading: true,
    allChecked: false,
  };

  handleCheckboxClick = (__: any, rowIndex: number) => {
    this.setState(state => {
      return produce(state, draft => {
        draft.data[rowIndex].checked = !draft.data[rowIndex].checked;
      });
    });
  };

  handleHeaderCheckboxClick = (__: any) => {
    this.setState(state => {
      return produce(state, draft => {
        draft.allChecked = !state.allChecked;
        draft.data.forEach(row => {
          row.checked = !state.allChecked;
        });
      });
    });
  };

  schema: ISchema[] = [
    {
      width: 200,
      template: ({ checked, rowIndex }: SimpleObject) => {
        return (
          <div>
            <input
              type="checkbox"
              onChange={event => this.handleCheckboxClick(event, rowIndex)}
              checked={checked}
            />
          </div>
        );
      },
      pinned: 'LEFT',
      get: ({ checked }: SimpleObject) => ({
        checked,
      }),
      header: () => {
        return (
          <input
            type="checkbox"
            onChange={this.handleHeaderCheckboxClick}
            checked={this.state.allChecked}
          />
        );
      },
    },
    {
      width: 150,
      template: ({ x }: SimpleObject) => <div>{x}</div>,
      pinned: 'LEFT',
      get: ({ b, c }: SimpleObject) => ({ x: b + c }),
      header: () => <>B</>,
    },
    {
      width: 100,
      template: ({ x }: SimpleObject) => <div>{x}</div>,
      get: ({ c }: SimpleObject) => ({ x: c }),
      header: () => <div style={{ height: 200 }}>C</div>,
    },
    {
      width: 200,
      template: ({ x }: SimpleObject) => <div>{x}</div>,
      get: ({ d }: SimpleObject) => ({ x: d }),
      header: () => <>D</>,
    },
    {
      width: 200,
      template: ({ x }: SimpleObject) => <div>{x}</div>,
      get: ({ e }: SimpleObject) => ({ x: e }),
      header: () => <>E</>,
    },
    {
      width: 100,
      template: ({ x }: SimpleObject) => (
        <img src={x} style={{ height: 35 }} alt="lol" />
      ),
      get: ({ logo }: SimpleObject) => ({ x: logo }),
      header: () => <>Image</>,
    },
    {
      width: 200,
      template: ({ x }: SimpleObject) => <div>{x}</div>,
      get: ({ note }: SimpleObject) => ({ x: note }),
      header: () => <>Note</>,
    },
  ];

  componentDidMount() {
    this.loadMoreData();
  }

  loadMoreData = () => {
    this.setState({ loading: true });
    setTimeout(() => {
      if (limit < 2000) {
        limit = limit + 100;
        this.setState({
          loading: false,
          data: getData(limit),
        });
      } else {
        this.setState({ loading: false });
      }
    }, 2500);
  };

  render() {
    return (
      <div className="App">
        <h1>Smart Grid</h1>
        <h3>
          <a href="https://github.com/mukuljainx/smart-grid/blob/master/README.md">
            Docs
          </a>
        </h3>
        <Grid
          style={{
            flexGrow: 2,
            maxHeight: 'calc(100% - 150px)',
            maxWidth: 1200,
          }}
          loadMore={this.loadMoreData}
          loadingMoreData={this.state.data.length > 0 && this.state.loading}
          buffer={5}
          dynamicRowHeight={false}
          rowHeight={40}
          headerHeight={40}
          schema={this.schema}
          data={this.state.data}
          loading={this.state.data.length === 0 && this.state.loading}
        />
      </div>
    );
  }
}
