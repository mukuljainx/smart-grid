import * as React from "react";
import { range } from "lodash-es";
import Table, { ISchema } from "../Table";

type SimpleObject = Record<string, string>;

const schema: ISchema[] = [
  {
    width: 200,
    template: ({ x }: SimpleObject) => <div>{x}</div>,
    pinned: "LEFT",
    get: ({ a }: SimpleObject) => ({
      x: a
    })
  },
  {
    width: 150,
    template: ({ x }: SimpleObject) => <div>{x}</div>,
    pinned: "LEFT",
    get: ({ b, c }: SimpleObject) => ({ x: b + c })
  },
  {
    width: 100,
    template: ({ x }: SimpleObject) => <div>{x}</div>,
    get: ({ c }: SimpleObject) => ({ x: c })
  },
  {
    width: 200,
    template: ({ x }: SimpleObject) => <div>{x}</div>,
    get: ({ d }: SimpleObject) => ({ x: d })
  },
  {
    width: 200,
    template: ({ x }: SimpleObject) => <div>{x}</div>,
    get: ({ e }: SimpleObject) => ({ x: e })
  },
  {
    width: 100,
    template: ({ x }: SimpleObject) => (
      <img src={x} style={{ height: 50 }} alt="lol" />
    ),
    get: ({ logo }: SimpleObject) => ({ x: logo })
  }
];

const getData = (limit: number) =>
  range(limit).map(i => ({
    a: `a ${i + 1}`,
    b: `b ${i + 1}`,
    c: `c ${i + 1}`,
    d: `d ${i + 1}`,
    e: `e ${i + 1}`,
    logo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Sketch_Logo.svg/1133px-Sketch_Logo.svg.png"
  }));

let limit = 100;

export default class App extends React.Component {
  state = {
    data: getData(limit),
    loading: false
  };

  loadMoreData = () => {
    console.log("LOAD MORE DATA");
    this.setState({ loading: true });
    setTimeout(() => {
      if (limit < 100) {
        limit = limit + 50;
        this.setState({
          laoding: false,
          data: getData(limit)
        });
      } else {
        this.setState({ loading: false });
      }
    }, 2500);
  };

  render() {
    return (
      <div className="App">
        <h1>React Table</h1>
        <Table
          style={{
            flexGrow: 2,
            maxHeight: "calc(100% - 150px)",
            maxWidth: 600
          }}
          loadMore={this.loadMoreData}
          buffer={10}
          rowHeight={50}
          schema={schema}
          data={this.state.data}
          loading={this.state.loading}
        />
      </div>
    );
  }
}
