import * as React from 'react';
import { range, random } from 'lodash-es';
import produce from 'immer';

import Grid, { ISchema } from '../Grid';
import users from './data';
import './index.scss';

type SimpleObject = Record<string, any>;

const note = `Pepper Potts as his oxygen supply starts to dwindle.`;

const notes: Record<number, string> = {};
range(10000).forEach((index: number) => {
  notes[index] = note.substr(0, random(20, note.length));
});

const getData = (limit: number) =>
  range(limit).map(i => ({
    ...users[i % users.length],
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

interface IProps {
  dynamicRowHeight?: boolean;
  style?: React.CSSProperties;
}

export default class App extends React.Component<IProps, IState> {
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
          <div className="cell-wrapper">
            <label className="checkbox-label">
              <input
                type="checkbox"
                onChange={event => this.handleCheckboxClick(event, rowIndex)}
                checked={checked}
              />
              <span className="checkbox-custom rectangular"></span>
            </label>
          </div>
        );
      },
      pinned: 'LEFT',
      get: ({ checked }: SimpleObject) => ({
        checked,
      }),
      header: () => {
        return (
          <div className="cell-wrapper">
            <label className="checkbox-label">
              <input
                type="checkbox"
                onChange={this.handleHeaderCheckboxClick}
                checked={this.state.allChecked}
              />
              <span className="checkbox-custom rectangular"></span>
            </label>
          </div>
        );
      },
    },
    {
      width: 150,
      template: (row: SimpleObject) => (
        <div className="cell-wrapper">
          {row.firstName} {row.lastName}
        </div>
      ),
      pinned: 'LEFT',
      get: ({ firstName, lastName }: SimpleObject) => ({
        firstName,
        lastName,
      }),
      header: () => <div className="cell-wrapper">Name</div>,
    },
    {
      width: 200,
      template: ({ x }: SimpleObject) => (
        <div className="cell-wrapper">{x}</div>
      ),
      get: ({ gender }: SimpleObject) => ({ x: gender }),
      header: () => <div className="cell-wrapper">Gender</div>,
    },
    {
      width: 200,
      template: ({ x }: SimpleObject) => (
        <div className="cell-wrapper ellipsis">{x}</div>
      ),
      get: ({ email }: SimpleObject) => ({ x: email }),
      header: () => <div className="cell-wrapper">Email</div>,
    },
    {
      width: 100,
      template: ({ x }: SimpleObject) => (
        <div className="image-wrapper">
          <img src={x} alt="Sketch app logo" />
        </div>
      ),
      get: ({ logo }: SimpleObject) => ({ x: logo }),
      header: () => <div className="cell-wrapper">Fav tool</div>,
    },
    {
      width: 200,
      template: ({ x }: SimpleObject) => (
        <div
          className={`cell-wrapper ${
            this.props.dynamicRowHeight ? '' : 'ellipsis'
          }`}
        >
          {x}
        </div>
      ),
      get: ({ note }: SimpleObject) => ({ x: note }),
      header: () => <div className="cell-wrapper">Note</div>,
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
      <div
        style={{
          height: 600,
          padding: 16,
          maxWidth: 800,
          ...this.props.style,
        }}
      >
        <Grid
          style={{
            flexGrow: 2,
            maxHeight: 'calc(100% - 150px)',
            maxWidth: 1200,
          }}
          loadMore={this.loadMoreData}
          loadingMoreData={this.state.data.length > 0 && this.state.loading}
          buffer={5}
          dynamicRowHeight={this.props.dynamicRowHeight}
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
