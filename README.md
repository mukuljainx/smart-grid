### Smart Grid

A light ![npm bundle size](https://img.shields.io/bundlephobia/minzip/@crafts/smart-grid) weight, highly customizable with css.

<br />

#### Features

1. Pinning
2. Virtualization
3. 826 bytes (gzipped)
4. styled-components friendly
5. Add className key to any row data to add an extra class to that row for custom styling
6. Dynamic height support

<br />

#### Props

<br />

| Prop name       | Type                  | Default   | Description                                                                |
| --------------- | --------------------- | --------- | -------------------------------------------------------------------------- |
| data            | Array                 | Required  | row data                                                                   |
| schema          | array                 | Required  | table schema                                                               |
| rowHeight       | number                | Required  | row height                                                                 |
| headerHeight    | number                | Required  | header height                                                              |
| buffer          | number                | 10        | extra rows to be loaded at the start and end of table for smooth scrolling |
| loading         | boolean               | false     | shows loader on whole table                                                |
| loadMore        | () => void            | undefined | called when user about reach the end of the table                          |
| loadingMoreData | boolean               | false     | shows a partial loader at the end of table                                 |
| virtualization  | boolean               | true      | Only visible and buffer rows will be rendered                              |
| getGridActions  | (gridActions) => void | undefined | Assign the gridActions to passed variable                                  |

#### Example

<br />

```
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

```

<br />
<br />

#### Schema

<br />

A sample object in schema array.

**get**: To only pass required data to that cell, as every cell is PureComponent, passing only required data saves re-rendering of that cell even if data for any other cell changes in the row.

```
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
```
