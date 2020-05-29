import React from 'react';
import { Progress, Avatar } from 'antd';
import moment from 'moment';
import Percent from './component/percent';
import IndexColumn from './component/indexColumn';
import { getProgressStatus } from './component/util';
import { ColumnEmptyText } from './Table';

/*
 * money amount
 * Option operation needs to return an array
 * date YYYY-MM-DD
 * dateRange date range YYYY-MM-DD []
 * dateTime date and time YYYY-MM-DD HH: mm: ss
 * dateTimeRange range date and time YYYY-MM-DD HH: mm: ss []
 * time: time HH: mm: ss
 * index: sequence
 * progress: progress bar
 * percent: percentage
 */
export type ProColumnsValueType =
  | 'money'
  | 'textarea'
  | 'option'
  | 'date'
  | 'dateRange'
  | 'dateTimeRange'
  | 'dateTime'
  | 'time'
  | 'text'
  | 'index'
  | 'indexBorder'
  | 'progress'
  | 'percent'
  | 'digit'
  | 'avatar'
  | 'code';

// function return type
export type ProColumnsValueObjectType = {
  type: 'progress' | 'money' | 'percent';
  status?: 'normal' | 'active' | 'success' | 'exception' | undefined;
  locale?: string;
  /** percent */
  showSymbol?: boolean;
  precision?: number;
};

/**
 * value type by function
 */
export type ProColumnsValueTypeFunction<T> = (
  item: T,
) => ProColumnsValueType | ProColumnsValueObjectType;

const moneyIntl = new Intl.NumberFormat('zh-Hans-CN', {
  currency: 'CNY',
  style: 'currency',
  minimumFractionDigits: 2,
});

const enMoneyIntl = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const ruMoneyIntl = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' });
const msMoneyIntl = new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' });

/**
 * render valueType object
 * @param text string | number
 * @param value ProColumnsValueObjectType
 */
const defaultRenderTextByObject = (text: string | number, value: ProColumnsValueObjectType) => {
  if (value.type === 'progress') {
    return (
      <Progress
        size="small"
        percent={text as number}
        status={value.status || getProgressStatus(text as number)}
      />
    );
  }
  if (value.type === 'money') {
    // english
    if (value.locale === 'en_US') {
      return enMoneyIntl.format(text as number);
    }
    // russian
    if (value.locale === 'ru_RU') {
      return ruMoneyIntl.format(text as number);
    }
    // malay
    if (value.locale === 'ms_MY') {
      return msMoneyIntl.format(text as number);
    }
    return moneyIntl.format(text as number);
  }
  if (value.type === 'percent') {
    return <Percent value={text} showSymbol={value.showSymbol} precision={value.precision} />;
  }
  return text;
};

/**
 * Convert values based on different types
 * @param text
 * @param valueType
 */
const defaultRenderText = <T, U>(
  text: string | number | React.ReactText[],
  valueType: ProColumnsValueType | ProColumnsValueTypeFunction<T>,
  index: number,
  item?: T,
  columnEmptyText?: ColumnEmptyText,
): React.ReactNode => {
  // when valueType == function
  // item always not null
  if (typeof valueType === 'function' && item) {
    const value = valueType(item);
    if (typeof value === 'string') {
      return defaultRenderText(text, value, index);
    }
    if (typeof value === 'object') {
      return defaultRenderTextByObject(text as string, value);
    }
  }

  /**
   * If the value of the amount
   */
  if (valueType === 'money' && (text || text === 0)) {
    /**
     * This API supports Samsung and Huawei phones
     */
    if (typeof text === 'string') {
      return moneyIntl.format(parseFloat(text));
    }
    return moneyIntl.format(text as number);
  }

  /**
   *If it is the value of the date
   */
  if (valueType === 'date' && text) {
    return moment(text).format('YYYY-MM-DD');
  }

  /**
   *If it is a date range value
   */
  if (valueType === 'dateRange' && text && Array.isArray(text) && text.length === 2) {
    // "-" Is displayed when the value does not exist
    return (
      <div>
        <div>{text[0] ? moment(text[0]).format('YYYY-MM-DD') : '-'}</div>
        <div>{text[1] ? moment(text[1]).format('YYYY-MM-DD') : '-'}</div>
      </div>
    );
  }

  /**
   *If it is a date plus time value
   */
  if (valueType === 'dateTime' && text) {
    return moment(text).format('YYYY-MM-DD HH:mm:ss');
  }

  /**
   *If it is a date plus time value
   */
  if (valueType === 'dateTimeRange' && text && Array.isArray(text) && text.length === 2) {
    // "-" Is displayed when the value does not exist
    return (
      <div>
        <div>{text[0] ? moment(text[0]).format('YYYY-MM-DD HH:mm:ss') : '-'}</div>
        <div>{text[1] ? moment(text[1]).format('YYYY-MM-DD HH:mm:ss') : '-'}</div>
      </div>
    );
  }

  /**
   *If it is a time value
   */
  if (valueType === 'time' && text) {
    return moment(text).format('HH:mm:ss');
  }

  if (valueType === 'index') {
    return <IndexColumn>{index + 1}</IndexColumn>;
  }

  if (valueType === 'indexBorder') {
    return <IndexColumn border>{index + 1}</IndexColumn>;
  }

  if (valueType === 'progress') {
    return (
      <Progress size="small" percent={text as number} status={getProgressStatus(text as number)} />
    );
  }
  /** Percentage, default display symbol, no decimal places */
  if (valueType === 'percent') {
    return <Percent value={text as number} />;
  }

  if (valueType === 'avatar' && typeof text === 'string') {
    return <Avatar src={text as string} size={22} shape="circle" />;
  }

  if (valueType === 'code' && text) {
    return (
      <pre
        style={{
          padding: 16,
          overflow: 'auto',
          fontSize: '85%',
          lineHeight: 1.45,
          backgroundColor: '#f6f8fa',
          borderRadius: 3,
        }}
      >
        <code>{text}</code>
      </pre>
    );
  }

  if (columnEmptyText) {
    if (typeof text !== 'boolean' && typeof text !== 'number' && !text) {
      return typeof columnEmptyText === 'string' ? columnEmptyText : '-';
    }
  }

  return text;
};

export default defaultRenderText;
