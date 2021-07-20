import * as React from 'react';
import '../smart-grid.css';
export type HeaderProps = JSX.IntrinsicElements['div'];

const HiddenScrollWrapper = (
  props: HeaderProps,
  ref: React.RefObject<HTMLDivElement>
) => {
  return (
    <div
      {...props}
      ref={ref}
      className={`smart-grid-hide-scroll-bar ${props?.className || ''}`}
    />
  );
};

export default React.forwardRef(HiddenScrollWrapper);
