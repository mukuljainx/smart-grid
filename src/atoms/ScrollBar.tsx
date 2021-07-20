import * as React from 'react';
export type HeaderProps = JSX.IntrinsicElements['div'];

const ScrollBar = (
  { style, ...rest }: HeaderProps,
  ref: React.RefObject<HTMLDivElement>
) => {
  return <div id="xx" style={{ ...style, height: 10 }} {...rest} ref={ref} />;
};

export default React.forwardRef(ScrollBar);
