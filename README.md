# Smart Grid

## Features

- 🪄 Virtualization
- 🎲 Dynamic Height
- 📌 [Pinned Columns (Synced Multi Grid)](https://smartgrid.mukulja.in/example/use-grids-pinned-column)
- ∞ Infinite Scroll
- 🛠 Highly configurable
- 💪 TypeScript
- ⚛ [Pretty small](https://bundlephobia.com/package/@crafts/smart-grid@latest)
- 🚀 Faster and lighter than V1
- 🎁 Out of the box Grid, just provide schema and data (releasing soon)
- 🤝 Backward compatibility (TBA)
- and much more 🔥

## Usage

`npm i && npm start`

```jsx
const { onScroll, rowRenderer } = useGrid({
  data: state.loading ? state.data.concat([null, null]) : state.data,
  rowHeight: rowHeight || 39,
  buffer,
  limit,
  loadMore: getData,
  virtualized,
});
```

For complete Documentation please visit: https://smartgrid.mukulja.in/

## Development Guide

This project has been divided in 3 parts,

1. Main package: `src`.
2. Documentation: `docs`.
3. Examples: `examples`, it contains various examples.

### Running main package watch mode

`npm i && npm start`

This will build files in watch mode at `examples/grid`

### Running dev server

To develope choose a type of example or copy any example and you can start there.

```bash
cd examples/example-name
npm i
npm start
```

For development purpose you can import smart grid apis from `examples/grid`.

### Docs

```bash
cd docs
npm i
npm start
```
