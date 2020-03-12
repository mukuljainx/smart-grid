import * as React from 'react';
import { range, random } from 'lodash-es';
import produce from 'immer';
import {
  Form,
  Toggle,
  FormControl,
  ControlLabel,
  FlexboxGrid,
  Checkbox,
  Divider,
  Avatar,
  Icon,
  Button,
} from 'rsuite';

import Grid, { ISchema, IGridActions } from '../Grid';
import NoteModal from './NoteModal';
import users from './users';
import colors from './colors';

type SimpleObject = Record<string, any>;

const note = `Adrift in space with no food or water, Tony Stark sends a message to Pepper Potts as his oxygen supply starts to dwindle. Meanwhile, the remaining Avengers were having lunch.`;

const notes: Record<number, string> = {};
range(100).forEach((index: number) => {
  notes[index] = note.substr(0, random(20, note.length));
});

type IUser = typeof users[0];
interface IRow extends IUser {
  checked: boolean;
  note: string;
}

interface IProps {
  dynamicRowHeight?: boolean;
  pinned?: boolean;
}

interface IState {
  loading: boolean;
  data: any;
  allChecked: boolean;
  noteModal?: { value: string; index: number };
  grid: {
    initialRows: number;
    virtualization: boolean;
    rowHeight: number;
    headerHeight: number;
    buffer: number;
    loadingMoreData: boolean;
    loading: boolean;
    limit: number;
  };
}

export default class App extends React.Component<IProps, IState> {
  state: IState = {
    data: [] as any,
    loading: true,
    allChecked: false,
    grid: {
      initialRows: 100,
      virtualization: true,
      rowHeight: 40,
      headerHeight: 40,
      buffer: 5,
      loadingMoreData: false,
      loading: false,
      limit: 2000,
    },
  };

  gridActions: IGridActions;
  totalRows = 0;

  getData = (limit: number): IRow[] =>
    range(limit).map(i => ({
      ...users[i % users.length],
      checked: false,
      note: notes[i % 100],
    }));

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
        draft.data.forEach((row: IRow) => {
          row.checked = !state.allChecked;
        });
      });
    });
  };

  componentDidMount() {
    this.loadMoreData(true);
  }

  componentDidUpdate(__: any, prevState: IState) {
    if (this.state.grid.initialRows !== prevState.grid.initialRows) {
      this.totalRows = 0;
      this.loadMoreData(true);
    }
  }

  loadMoreData = (firstRender?: boolean) => {
    this.setState(state => ({
      loading: true,
      data: firstRender ? [] : state.data,
    }));
    setTimeout(() => {
      if (this.totalRows < this.state.grid.limit) {
        this.totalRows =
          this.totalRows + (firstRender ? this.state.grid.initialRows : 100);
        this.setState(state => ({
          loading: false,
          data: [
            ...state.data,
            ...this.getData(this.totalRows - state.data.length),
          ],
        }));
      } else {
        this.setState({ loading: false });
      }
    }, 2500);
  };

  handleInputChange = (
    fieldKey: keyof IState['grid'],
    value: string | number | boolean
  ) => {
    this.setState(state => ({
      grid: { ...state.grid, [fieldKey]: value },
    }));
  };

  getSchema = (): ISchema[] => {
    return [
      {
        width: 50,
        template: ({ checked, rowIndex }: SimpleObject) => {
          return (
            <div className="cell-wrapper">
              <Checkbox
                onChange={event => this.handleCheckboxClick(event, rowIndex)}
                checked={checked}
              />
            </div>
          );
        },
        pinned: this.props.pinned ? 'LEFT' : undefined,
        get: ({ checked }: SimpleObject) => ({
          checked,
        }),
        header: () => {
          return (
            <div className="cell-wrapper">
              <Checkbox
                onChange={this.handleHeaderCheckboxClick}
                checked={this.state.allChecked}
              />
            </div>
          );
        },
      },
      {
        width: 100,
        pinned: this.props.pinned ? 'LEFT' : undefined,
        template: ({ x, rowIndex }: SimpleObject) => (
          <div className="image-wrapper">
            <Avatar
              size="sm"
              circle
              style={{
                background: colors[rowIndex % colors.length],
              }}
            >
              {x}
            </Avatar>
          </div>
        ),
        get: ({ firstName, lastName }: SimpleObject) => ({
          x: firstName[0] + lastName[0],
        }),
        header: () => <></>,
      },
      {
        width: 200,
        template: (row: SimpleObject) => (
          <div className="cell-wrapper">
            {row.firstName} {row.lastName}
          </div>
        ),
        pinned: this.props.pinned ? 'LEFT' : undefined,
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
        width: 200,
        template: ({ x, rowIndex }: SimpleObject) => (
          <div
            className={`cell-wrapper ${
              this.props.dynamicRowHeight ? '' : 'ellipsis'
            }`}
          >
            {x}
            {this.props.dynamicRowHeight && (
              <Button
                style={{ marginLeft: 4, cursor: 'hover' }}
                onClick={() => this.toggleModal(rowIndex)}
              >
                <Icon icon="edit" />
              </Button>
            )}
          </div>
        ),
        get: ({ note }: SimpleObject) => ({ x: note }),
        header: () => <div className="cell-wrapper">Note</div>,
      },
    ];
  };

  toggleModal = (index?: number) => {
    this.setState(state => ({
      noteModal: {
        value: state.data[index].note,
        index: index,
      },
    }));
  };

  updateNote = (note: string) => {
    this.setState(state => {
      return produce(
        state,
        draft => {
          draft.data[state.noteModal.index].note = note;
          draft.noteModal = undefined;
        },
        () => {
          if (this.gridActions) {
            this.gridActions.refreshRows([state.noteModal.index]);
          }
        }
      );
    });
  };

  closeModal = () => {
    this.setState({ noteModal: undefined });
  };

  getGridActions = (gridActions: IGridActions) => {
    this.gridActions = gridActions;
  };

  render() {
    return (
      <div>
        <div>
          <h3>Props</h3>
          <p style={{ maxWidth: 800 }}>
            You can toggle some the props here to see how table behaves some
            complex props like Grid data, schema, loadMore has been Ommited here
            as they are generated using generators.{' '}
            <a
              href="https://github.com/mukuljainx/smart-grid/blob/master/src/Example/Example.tsx"
              target="_blank"
            >
              View example code on Github
            </a>
          </p>
          <Divider />
          <Form className="example-form">
            <FlexboxGrid align="middle">
              <ControlLabel style={{ marginRight: 8 }}>Row Height</ControlLabel>
              <FormControl
                value={this.state.grid.rowHeight}
                onChange={value =>
                  this.handleInputChange('rowHeight', parseInt(value || '0'))
                }
                name="rowHeight"
              />
              <ControlLabel style={{ marginRight: 8 }}>
                Header Height
              </ControlLabel>
              <FormControl
                value={this.state.grid.headerHeight}
                onChange={value =>
                  this.handleInputChange('headerHeight', parseInt(value || '0'))
                }
                name="headerHeight"
              />
              <ControlLabel style={{ marginRight: 8 }}>Buffer</ControlLabel>
              <FormControl
                value={this.state.grid.buffer}
                onChange={value =>
                  this.handleInputChange('buffer', parseInt(value || '0'))
                }
                name="headerHeight"
              />
              <ControlLabel style={{ marginRight: 8 }}>Max Rows</ControlLabel>
              <FormControl
                value={this.state.grid.limit}
                onChange={value =>
                  this.handleInputChange('limit', parseInt(value || '0'))
                }
                name="headerHeight"
              />
              <ControlLabel style={{ marginRight: 8 }}>
                Initial Rows
              </ControlLabel>
              <FormControl
                value={this.state.grid.initialRows}
                onChange={value =>
                  this.handleInputChange('initialRows', parseInt(value || '0'))
                }
                name="headerHeight"
              />
            </FlexboxGrid>
            <FlexboxGrid align="middle">
              <ControlLabel style={{ marginRight: 8 }}>
                Virtualization
              </ControlLabel>
              <Toggle
                checked={this.state.grid.virtualization}
                onChange={value =>
                  this.handleInputChange('virtualization', value)
                }
              />
              <ControlLabel style={{ marginRight: 8 }}>
                Loading More Data
              </ControlLabel>
              <Toggle
                checked={this.state.grid.loadingMoreData}
                onChange={value =>
                  this.handleInputChange('loadingMoreData', value)
                }
              />
              <ControlLabel style={{ marginRight: 8 }}>Loading</ControlLabel>
              <Toggle
                checked={this.state.grid.loading}
                onChange={value => this.handleInputChange('loading', value)}
              />
            </FlexboxGrid>
          </Form>
          <Divider />
        </div>
        <div
          style={{
            height: 600,
            maxWidth: 800,
          }}
        >
          <Grid
            style={{
              flexGrow: 2,
              maxHeight: 'calc(100% - 150px)',
              maxWidth: 1200,
            }}
            loadMore={this.loadMoreData}
            loadingMoreData={
              (this.state.data.length > 0 && this.state.loading) ||
              this.state.grid.loadingMoreData
            }
            getGridActions={
              this.props.dynamicRowHeight ? this.getGridActions : undefined
            }
            buffer={5}
            dynamicRowHeight={this.props.dynamicRowHeight}
            rowHeight={this.state.grid.rowHeight}
            headerHeight={this.state.grid.headerHeight}
            virtualization={this.state.grid.virtualization}
            schema={this.getSchema()}
            data={this.state.data}
            loading={
              (this.state.data.length === 0 && this.state.loading) ||
              this.state.grid.loading
            }
          />
        </div>

        {this.state.noteModal && (
          <NoteModal
            note={this.state.noteModal.value}
            onClose={this.closeModal}
            onNoteSave={this.updateNote}
          />
        )}
      </div>
    );
  }
}
