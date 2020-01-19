import * as React from 'react';
import { range } from 'lodash-es';
import Table, { ISchema } from '../Grid';

type SimpleObject = Record<string, string>;

const schema: ISchema[] = [
  {
    width: 200,
    template: ({ x }: SimpleObject) => <div>{x}</div>,
    pinned: 'LEFT',
    get: ({ a }: SimpleObject) => ({
      x: a,
    }),
    header: 'A',
  },
  {
    width: 150,
    template: ({ x }: SimpleObject) => <div>{x}</div>,
    pinned: 'LEFT',
    get: ({ b, c }: SimpleObject) => ({ x: b + c }),
    header: 'B',
  },
  {
    width: 100,
    template: ({ x }: SimpleObject) => <div>{x}</div>,
    get: ({ c }: SimpleObject) => ({ x: c }),
    header: <div style={{ height: 200 }}>C</div>,
  },
  {
    width: 200,
    template: ({ x }: SimpleObject) => <div>{x}</div>,
    get: ({ d }: SimpleObject) => ({ x: d }),
    header: 'D',
  },
  {
    width: 200,
    template: ({ x }: SimpleObject) => <div>{x}</div>,
    get: ({ e }: SimpleObject) => ({ x: e }),
    header: 'E',
  },
  {
    width: 100,
    template: ({ x }: SimpleObject) => (
      <img src={x} style={{ height: 35 }} alt="lol" />
    ),
    get: ({ logo }: SimpleObject) => ({ x: logo }),
    header: 'Image',
  },
];

const getData = (limit: number) =>
  range(limit).map(i => ({
    a: `a ${i + 1}`,
    b: `b ${i + 1}`,
    c: `c ${i + 1}`,
    d: `d ${i + 1}`,
    e: `e ${i + 1}`,
    logo:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Sketch_Logo.svg/1133px-Sketch_Logo.svg.png',
  }));

let limit = 0;

export default class App extends React.Component {
  state = {
    data: [] as any,
    loading: true,
  };

  componentDidMount() {
    this.loadMoreData();
  }

  loadMoreData = () => {
    this.setState({ loading: true });
    setTimeout(() => {
      if (limit < 1000) {
        limit = limit + 50;
        this.setState({
          laoding: false,
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
        <Table
          style={{
            flexGrow: 2,
            maxHeight: 'calc(100% - 150px)',
            maxWidth: 600,
          }}
          loadMore={this.loadMoreData}
          loadingMoreData={this.state.data.length > 0 && this.state.loading}
          buffer={10}
          rowHeight={40}
          headerHeight={40}
          schema={schema}
          data={this.state.data}
          loading={this.state.data.length === 0 && this.state.loading}
        />
      </div>
    );
  }
}
