// import * as React from 'react';
// import useTables from '../Grid/hooks/useTables';
// import { sampleSize, random } from 'lodash';

// const randomString = [
//   'Montain',
//   'Heavy',
//   'bike',
//   'car',
//   'broken',
//   'all',
//   'of',
//   'me',
//   'dance',
//   'kick',
// ];

// const generateData = (offset = 0) =>
//   new Array(100).fill(0).map((_, i) => ({
//     firstName: sampleSize(randomString, random(1, 5)).join(' '),
//     lastName: sampleSize(randomString, random(1, 5)).join(' '),
//     age: `2${i + offset}`,
//   }));

// const api = (offset: number) =>
//   new Promise<any>((res) => {
//     setTimeout(() => {
//       res(generateData(offset));
//     }, 1200);
//   });

// interface IProps {
//   rowHeight?: number;
//   buffer?: number;
//   limit?: number;
// }

// const Table = ({ rowHeight, buffer, limit }: IProps) => {
//   const [data, setData] = React.useState(generateData());
//   // const [loading, setLoading] = React.useState(false);
//   const loading = React.useRef(false);
//   const getData = React.useCallback(
//     (sp: number) => {
//       console.log(sp, loading.current);
//       if (loading.current) {
//         return;
//       }
//       console.log('CALL');
//       loading.current = true;
//       offset.current += 100;
//       api(offset.current).then((newD) => {
//         setData((d) => [...d, ...newD]);
//         loading.current = false;
//       });
//     },
//     [loading]
//   );
//   const {
//     onScroll,
//     tableRenderers,
//     tableHeight,
//     horizontalSync,
//     bodyRef,
//     headerRef,
//     tableRef,
//     actions,
//   } = useTables(2, {
//     totalCount: data.length + (loading.current ? 2 : 0),
//     rowHeight: rowHeight || 39,
//     buffer,
//     limit,
//     dynamicHeight: true,
//     loadMore: getData,
//   });
//   const offset = React.useRef(0);

//   // @ts-ignore
//   window.tableX = { actions };

//   return (
//     <div className="App">
//       <div
//         style={{
//           display: 'flex',
//           border: '1px solid red',
//           overflow: 'hidden',
//         }}
//       >
//         {[0, 1].map((i) => (
//           <div
//             onScroll={horizontalSync[i]}
//             ref={headerRef[i] as any}
//             style={{ width: i === 0 ? 200 : 300, overflowX: 'auto' }}
//           >
//             <div>
//               {i === 0 && (
//                 <tr>
//                   <th style={{ width: 200 }}>First Name</th>
//                 </tr>
//               )}
//               {i === 1 && (
//                 <tr>
//                   <th style={{ width: 200 }}>Last Name</th>
//                   <th style={{ width: 200 }}>Age</th>
//                   <th style={{ width: 200 }}>Last Name</th>
//                   <th style={{ width: 200 }}>Age</th>
//                   <th style={{ width: 200 }}>Last Name</th>
//                   <th style={{ width: 200 }}>Age</th>
//                 </tr>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div
//         onScroll={onScroll}
//         ref={tableRef}
//         style={{
//           display: 'flex',
//           height: 480,
//           overflowY: 'auto',
//           overflowX: 'hidden',
//           border: '1px solid red',
//         }}
//       >
//         {tableRenderers.map((tableRenderer, i) => (
//           <div
//             style={{
//               position: 'relative',
//               flexShrink: 0,
//               overflowX: 'auto',
//               overflowY: 'hidden',
//               height: tableHeight + (loading.current ? 2 * 39 : 0),
//               maxWidth: 300,
//             }}
//             ref={bodyRef[i] as any}
//             onScroll={horizontalSync[i]}
//           >
//             <tbody style={{ position: 'relative', width: i == 0 ? 200 : 1200 }}>
//               {tableRenderer(
//                 loading.current ? data.concat([null, null]) : data,
//                 (row, style, index, ref) =>
//                   row ? (
//                     <tr
//                       ref={ref}
//                       className="table-row"
//                       data-testid={`table-row-${index}`}
//                       style={style}
//                       key={index}
//                     >
//                       {i === 0 && (
//                         <td style={{ width: 200 }}>
//                           {index}:{row.firstName}
//                         </td>
//                       )}
//                       {i === 1 && (
//                         <>
//                           <td style={{ width: 200 }}>
//                             {index}: {row.lastName}
//                           </td>
//                           <td style={{ width: 200 }}>{row.age}</td>
//                           <td style={{ width: 200 }}>
//                             {index}: {row.lastName}
//                           </td>
//                           <td style={{ width: 200 }}>{row.age}</td>
//                           <td style={{ width: 200 }}>
//                             {index}: {row.lastName}
//                           </td>
//                           <td style={{ width: 200 }}>{row.age}</td>
//                         </>
//                       )}
//                     </tr>
//                   ) : (
//                     <tr
//                       ref={ref}
//                       className="table-row"
//                       data-testid={`table-row-${index}`}
//                       style={style}
//                       key={index}
//                     >
//                       <td>Loading</td>
//                     </tr>
//                   )
//               )}
//             </tbody>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Table;
