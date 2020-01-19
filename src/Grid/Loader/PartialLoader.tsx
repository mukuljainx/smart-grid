import * as React from 'react';

import { Placeholder, ISchema } from '..';

type IDivIntrinsicProps = JSX.IntrinsicElements['div'];

interface IProps extends IDivIntrinsicProps {
  schema: ISchema[];
  rowStyle: React.CSSProperties;
}

class PartialLoader extends React.PureComponent<IProps> {
  render() {
    const { rowStyle, schema, ...rest } = this.props;

    return (
      <div {...rest}>
        {[0, 1].map(index => (
          <div key={index} className="loader-row" style={rowStyle}>
            {schema.map(({ width }, j) => (
              <Placeholder
                key={j}
                style={{ width }}
                shimmerWidth={(6 + Math.random() * 4) * 10}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
}

export default PartialLoader;
