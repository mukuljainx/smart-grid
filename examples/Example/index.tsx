import * as React from 'react';
import './index.css';
import Basic from './basic';
import BasicWithoutVirtualization from './BasicWithoutVirtualization';
import DynamicHeight from './DynamicHeight';
import PinnedTable from './PinnedTable';

export default function App() {
  return (
    <div className="App">
      <PinnedTable />
      {/* <Basic /> */}
      {/* <BasicWithoutVirtualization /> */}
      {/* <DynamicHeight /> */}
    </div>
  );
}
