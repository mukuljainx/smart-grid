import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';

import PinnedTable from './PinnedTable';

const App = () => (
  <div className="App">
    <PinnedTable />
  </div>
);

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
