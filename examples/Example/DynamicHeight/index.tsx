import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';

import DynamicHeight from './DynamicHeight';

const App = () => (
  <div className="App">
    <DynamicHeight />
  </div>
);

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
