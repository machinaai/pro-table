import React, { Fragment, ReactNode, useMemo } from 'react';
import toNumber from 'lodash.tonumber';

import { getColorByRealValue, getSymbolByRealValue, getRealTextWithPrecision } from './util';

export interface PercentPropInt {
  prefix?: ReactNode;
  suffix?: ReactNode;
  value?: number | string;
  precision?: number;
  showColor?: boolean;
  showSymbol?: boolean;
}

const Percent: React.SFC<PercentPropInt> = ({
  value,
  prefix,
  precision,
  showSymbol,
  suffix = '%',
  showColor = false,
}) => {
  const realValue = useMemo(
    () =>
      typeof value === 'string' && value.includes('%')
        ? toNumber(value.replace('%', ''))
        : toNumber(value),
    [value],
  );
  /** The color is to be determined, according to the provided colors: ['positive', 'negative'] | boolean */
  const style = showColor ? { color: getColorByRealValue(realValue) } : {};

  return (
    <span style={style}>
      {prefix && <span>{prefix}</span>}
      {showSymbol && <Fragment>{getSymbolByRealValue(realValue)}&nbsp;</Fragment>}
      {getRealTextWithPrecision(realValue, precision)}
      {suffix && suffix}
    </span>
  );
};

export default Percent;
