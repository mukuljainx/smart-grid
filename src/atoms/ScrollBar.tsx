import * as React from 'react';
export type HeaderProps = JSX.IntrinsicElements['div'];

const ScrollBar: React.FC<HeaderProps> = React.forwardRef(
  ({ style, ...rest }, ref) => {
    return <div id="xx" style={{ ...style, height: 10 }} {...rest} ref={ref} />;
  }
);

export default ScrollBar;
