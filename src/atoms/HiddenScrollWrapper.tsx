import * as React from 'react';
import '../smart-grid.css';
export type HeaderProps = JSX.IntrinsicElements['div'];

const HiddenScrollWrapper: React.FC<HeaderProps> = React.forwardRef(
  (props, ref) => {
    return (
      <div
        {...props}
        ref={ref}
        className={`smart-grid-hide-scroll-bar ${props.className || ''}`}
      />
    );
  }
);

export default HiddenScrollWrapper;
