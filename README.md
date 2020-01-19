### Smart Grid

A light weight alternate to ag-grid.

#### Features

1. Pinning
2. Virtualization

#### Example

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
