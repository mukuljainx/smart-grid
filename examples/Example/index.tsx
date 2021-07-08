import * as React from 'react';
import './index.css';
import Basic from './basic';
import BasicWithoutVirtualization from './BasicWithoutVirtualization';
// import Pinned from './Pinned';

export default function App() {
  return (
    <div className="App">
      {/* <Pinned /> */}
      {/* <Basic /> */}
      <BasicWithoutVirtualization />
    </div>
  );
}
