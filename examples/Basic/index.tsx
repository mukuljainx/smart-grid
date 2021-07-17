import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';

import Basic from './Basic';

const App = () => (
  <div className="App">
    <Basic />
  </div>
);

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
