import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';

import BasicWithoutVirtualization from './BasicWithoutVirtualization';

const App = () => (
  <div className="App">
    <BasicWithoutVirtualization />
  </div>
);

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
