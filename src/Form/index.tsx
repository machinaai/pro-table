import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FormInstance, FormItemProps, FormProps } from 'antd/es/form';
import { Input, Form, Row, Col, TimePicker, InputNumber, DatePicker, Select } from 'antd';
import moment, { Moment } from 'moment';
import RcResizeObserver from 'rc-resize-observer';
import useMediaQuery from 'use-media-antd-query';
import useMergeValue from 'use-merge-value';
import { ConfigConsumer, ConfigConsumerProps } from 'antd/lib/config-provider';
import { DownOutlined } from '@ant-design/icons';
import classNames from 'classnames';

import { parsingValueEnumToArray, useDeepCompareEffect, genColumnKey } from '../component/util';
import { useIntl, IntlType } from '../component/intlContext';
import Container from '../container';
import { ProColumnsValueTypeFunction } from '../defaultRender';
import { ProTableTypes } from '../Table';
import { ProColumns, ProColumnsValueType } from '../index';
import FormOption, { FormOptionProps } from './FormOption';
import './index.less';

/**
 * Default form configuration
 */
const defaultColConfig = {
  lg: 8,
  md: 12,
  xxl: 6,
  xl: 8,
  sm: 12,
  xs: 24,
};

/**
 * Default new form configuration
 */
const defaultFormColConfig = {
  lg: 24,
  md: 24,
  xxl: 24,
  xl: 24,
  sm: 24,
  xs: 24,
};

/**
 * Used to configure the operation bar
 */
export interface SearchConfig {
  /**
   * Query button text
   */
  searchText?: string;
  /**
   * Reset button text
   */
  resetText?: string;
  span?: number | typeof defaultColConfig;
  /**
   * Collapse button render
   */
  collapseRender?: (
    collapsed: boolean,
    /**
     * Whether it should be displayed, there are two cases
     * There are only three columns, no need to collapse
     * form mode
     */
    showCollapseButton?: boolean,
  ) => React.ReactNode;
  /**
   * At the bottom of the action bar render
   * searchConfig Basic configuration
   * props More detailed configuration
   * {
      type?: 'form' | 'list' | 'table' | 'cardList' | undefined;
      form: FormInstance;
      submit: () => void;
      collapse: boolean;
      setCollapse: (collapse: boolean) => void;
      showCollapseButton: boolean;
   * }
   */
  optionRender?:
    | ((
        searchConfig: Omit<SearchConfig, 'optionRender'>,
        props: Omit<FormOptionProps, 'searchConfig'>,
      ) => React.ReactNode)
    | false;
  /**
   * Whether to put away
   */
  collapsed?: boolean;
  /**
   * Collapse button event
   */
  onCollapse?: (collapsed: boolean) => void;
  /**
   * Submit button text
   */
  submitText?: string;
}

/**
 * Get the offset of the last row and ensure that it is in the last column
 * @param length
 * @param span
 */
const getOffset = (length: number, span: number = 8) => {
  const cols = 24 / span;
  return (cols - 1 - (length % cols)) * span;
};

/**
 * Default setting
 */
const defaultSearch: SearchConfig = {
  searchText: 'Search',
  resetText: 'Reset',
  span: defaultColConfig,
  collapseRender: (collapsed: boolean) => (collapsed ? 'Unfold' : 'Collapse'),
};

export interface TableFormItem<T> extends Omit<FormItemProps, 'children'> {
  onSubmit?: (value: T) => void;
  onReset?: () => void;
  form?: Omit<FormProps, 'form'>;
  type?: ProTableTypes;
  dateFormatter?: 'string' | 'number' | false;
  search?: boolean | SearchConfig;
  formRef?: React.MutableRefObject<FormInstance | undefined> | ((actionRef: FormInstance) => void);
}

export const formIsNull = (props: {
  item: ProColumns<any>;
  value?: any;
  form?: Omit<FormInstance, 'scrollToField' | '__INTERNAL__'>;
  type: ProTableTypes;
  intl: IntlType;
  onChange?: (value: any) => void;
}) => {
  const { item, intl, form, type, ...rest } = props;
  /**
   * customize render
   */
  if (item.renderFormItem) {
    /**
     *Remove renderFormItem to prevent repeated dom rendering
     */
    const { renderFormItem, ...restItem } = item;
    const defaultRender = (newItem: ProColumns<any>) => (
      <FormInputRender
        {...({
          ...props,
          item: newItem,
        } || null)}
      />
    );
    return item.renderFormItem(restItem, { ...rest, type, defaultRender }, form as any) as any;
  }
  return true;
};

export const FormInputRender: React.FC<{
  item: ProColumns<any>;
  value?: any;
  form?: Omit<FormInstance, 'scrollToField' | '__INTERNAL__'>;
  type: ProTableTypes;
  intl: IntlType;
  onChange?: (value: any) => void;
}> = (props) => {
  const { item, intl, form, type, ...rest } = props;
  const { valueType: itemValueType } = item;
  // if function， run it
  const valueType = typeof itemValueType === 'function' ? itemValueType({}) : itemValueType;
  /**
   * customize render
   */
  if (item.renderFormItem) {
    /**
     *Remove renderFormItem to prevent repeated dom rendering
     */
    const { renderFormItem, ...restItem } = item;
    const defaultRender = (newItem: ProColumns<any>) => (
      <FormInputRender
        {...({
          ...props,
          item: newItem,
        } || null)}
      />
    );
    return item.renderFormItem(restItem, { ...rest, type, defaultRender }, form as any) as any;
  }

  if (!valueType || valueType === 'text') {
    const { valueEnum } = item;
    if (valueEnum) {
      return (
        <Select
          placeholder={intl.getMessage('tableForm.selectPlaceholder', 'please select')}
          {...rest}
          {...item.formItemProps}
        >
          {parsingValueEnumToArray(valueEnum).map(({ value, text }) => (
            <Select.Option key={value} value={value}>
              {text}
            </Select.Option>
          ))}
        </Select>
      );
    }
    return (
      <Input
        placeholder={intl.getMessage('tableForm.inputPlaceholder', 'please enter')}
        {...rest}
        {...item.formItemProps}
      />
    );
  }
  if (valueType === 'date') {
    return (
      <DatePicker
        placeholder={intl.getMessage('tableForm.selectPlaceholder', 'please select')}
        style={{
          width: '100%',
        }}
        {...rest}
        {...item.formItemProps}
      />
    );
  }

  if (valueType === 'dateTime') {
    return (
      <DatePicker
        showTime
        placeholder={intl.getMessage('tableForm.selectPlaceholder', 'please select')}
        style={{
          width: '100%',
        }}
        {...rest}
        {...item.formItemProps}
      />
    );
  }

  if (valueType === 'dateRange') {
    return (
      <DatePicker.RangePicker
        placeholder={[
          intl.getMessage('tableForm.selectPlaceholder', 'please select'),
          intl.getMessage('tableForm.selectPlaceholder', 'please select'),
        ]}
        style={{
          width: '100%',
        }}
        {...rest}
        {...item.formItemProps}
      />
    );
  }
  if (valueType === 'dateTimeRange') {
    return (
      <DatePicker.RangePicker
        showTime
        placeholder={[
          intl.getMessage('tableForm.selectPlaceholder', 'please select'),
          intl.getMessage('tableForm.selectPlaceholder', 'please select'),
        ]}
        style={{
          width: '100%',
        }}
        {...rest}
        {...item.formItemProps}
      />
    );
  }

  if (valueType === 'time') {
    return (
      <TimePicker
        placeholder={intl.getMessage('tableForm.selectPlaceholder', 'please select')}
        style={{
          width: '100%',
        }}
        {...rest}
        {...item.formItemProps}
      />
    );
  }
  if (valueType === 'digit') {
    return (
      <InputNumber
        placeholder={intl.getMessage('tableForm.inputPlaceholder', 'please enter')}
        style={{
          width: '100%',
        }}
        {...rest}
        {...item.formItemProps}
      />
    );
  }
  if (valueType === 'money') {
    return (
      <InputNumber
        min={0}
        precision={2}
        formatter={(value) => {
          if (value) {
            return `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          }
          return '';
        }}
        parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, '') : '')}
        placeholder={intl.getMessage('tableForm.inputPlaceholder', 'please enter')}
        style={{
          width: '100%',
        }}
        {...rest}
        {...item.formItemProps}
      />
    );
  }
  if (valueType === 'textarea' && type === 'form') {
    return (
      <Input.TextArea
        placeholder={intl.getMessage('tableForm.inputPlaceholder', 'please enter')}
        {...rest}
        {...item.formItemProps}
      />
    );
  }
  return (
    <Input
      placeholder={intl.getMessage('tableForm.inputPlaceholder', 'please enter')}
      {...rest}
      {...item.formItemProps}
    />
  );
};

export const proFormItemRender: (props: {
  item: ProColumns<any>;
  isForm: boolean;
  type: ProTableTypes;
  intl: IntlType;
  formInstance?: Omit<FormInstance, 'scrollToField' | '__INTERNAL__'>;
  colConfig:
    | {
        lg: number;
        md: number;
        xxl: number;
        xl: number;
        sm: number;
        xs: number;
      }
    | {
        span: number;
      }
    | undefined;
}) => null | JSX.Element = ({ item, intl, formInstance, type, isForm, colConfig }) => {
  const {
    valueType,
    dataIndex,
    valueEnum,
    renderFormItem,
    render,
    hideInForm,
    hideInSearch,
    hideInTable,
    renderText,
    order,
    initialValue,
    ellipsis,
    formItemProps,
    index,
    ...rest
  } = item;
  const key = genColumnKey(rest.key, dataIndex, index);
  const renderItemDom = formIsNull({
    item,
    type,
    intl,
    form: formInstance,
  });
  if (!renderItemDom) {
    return null;
  }
  const dom = <FormInputRender item={item} type={type} intl={intl} form={formInstance} />;
  if (!dom) {
    return null;
  }
  return (
    <Col {...colConfig} key={key}>
      <Form.Item labelAlign="right" label={rest.title} name={key} {...(isForm && rest)}>
        {dom}
      </Form.Item>
    </Col>
  );
};

const dateFormatterMap = {
  time: 'HH:mm:ss',
  date: 'YYYY-MM-DD',
  dateTime: 'YYYY-MM-DD HH:mm:ss',
  dateRange: 'YYYY-MM-DD',
  dateTimeRange: 'YYYY-MM-DD HH:mm:ss',
};

/**
 * Determine if DataType is a date type
 * @param type
 */
const isDateValueType = (type: ProColumnsValueType | ProColumnsValueTypeFunction<any>) => {
  let valueType: ProColumnsValueType = type as ProColumnsValueType;
  if (typeof type === 'function') {
    // If it is an object, it is a progress bar, directly return false
    if (typeof type({}) === 'object') {
      return false;
    }
    valueType = type({}) as ProColumnsValueType;
  }
  const dateTypes = ['date', 'dateRange', 'dateTimeRange', 'dateTime', 'time'];
  return dateTypes.includes(valueType);
};

/**
 * Here is mainly to transform the data
 * Convert moment to string
 * Delete all by default
 * @param value
 * @param dateFormatter
 * @param proColumnsMap
 */
const conversionValue = (
  value: any,
  dateFormatter: string | boolean,
  proColumnsMap: { [key: string]: ProColumns<any> },
) => {
  const tmpValue = {};

  Object.keys(value).forEach((key) => {
    const column = proColumnsMap[key || 'null'] || {};
    const valueType = column.valueType || 'text';
    const itemValue = value[key];

    // If the value is "all", or if there is no deletion
    // Select all in the drop-down box and it will be deleted
    if (itemValue === undefined || (itemValue === 'all' && column.valueEnum)) {
      return;
    }

    // If it is a date, then process these
    if (!isDateValueType(valueType)) {
      tmpValue[key] = itemValue;
      return;
    }

    // If it's a moment object
    // If executed here, it must be one of ['date', 'dateRange', 'dateTimeRange', 'dateTime', 'time']
    if (moment.isMoment(itemValue) && dateFormatter) {
      if (dateFormatter === 'string') {
        const formatString = dateFormatterMap[valueType as 'dateTime'];
        tmpValue[key] = (itemValue as Moment).format(formatString || 'YYYY-MM-DD HH:mm:ss');
        return;
      }
      if (dateFormatter === 'number') {
        tmpValue[key] = (itemValue as Moment).valueOf();
        return;
      }
    }

    // Here is the date array
    if (Array.isArray(itemValue) && itemValue.length === 2 && dateFormatter) {
      if (dateFormatter === 'string') {
        const formatString = dateFormatterMap[valueType as 'dateTime'];
        tmpValue[key] = [
          moment(itemValue[0] as Moment).format(formatString || 'YYYY-MM-DD HH:mm:ss'),
          moment(itemValue[1] as Moment).format(formatString || 'YYYY-MM-DD HH:mm:ss'),
        ];
        return;
      }
      if (dateFormatter === 'number') {
        tmpValue[key] = [
          moment(itemValue[0] as Moment).valueOf(),
          moment(itemValue[1] as Moment).valueOf(),
        ];
      }
    }
  });
  return tmpValue;
};

const getDefaultSearch = (
  search: boolean | SearchConfig | undefined,
  intl: IntlType,
  isForm: boolean,
): SearchConfig => {
  const config = {
    collapseRender: (collapsed: boolean) => {
      if (collapsed) {
        return (
          <>
            {intl.getMessage('tableForm.collapsed', 'Unfold')}
            <DownOutlined
              style={{
                marginLeft: '0.5em',
                transition: '0.3s all',
                transform: `rotate(${collapsed ? 0 : 0.5}turn)`,
              }}
            />
          </>
        );
      }
      return (
        <>
          {intl.getMessage('tableForm.expand', 'Collapse')}
          <DownOutlined
            style={{
              marginLeft: '0.5em',
              transition: '0.3s all',
              transform: `rotate(${collapsed ? 0 : 0.5}turn)`,
            }}
          />
        </>
      );
    },
    searchText: intl.getMessage('tableForm.search', defaultSearch.searchText || 'Inquire'),
    resetText: intl.getMessage('tableForm.reset', defaultSearch.resetText || 'Reset'),
    submitText: intl.getMessage('tableForm.submit', defaultSearch.submitText || 'submit'),
    span: isForm ? defaultFormColConfig : defaultColConfig,
  };

  if (search === undefined || search === true) {
    return config;
  }

  return { ...config, ...search } as Required<SearchConfig>;
};

/**
 * Merging users and default configuration
 * @param span
 * @param size
 */
const getSpanConfig = (
  span: number | typeof defaultColConfig,
  size: keyof typeof defaultColConfig,
): number => {
  if (typeof span === 'number') {
    return span;
  }
  const config = {
    ...defaultColConfig,
    ...span,
  };
  return config[size];
};

const FormSearch = <T, U = {}>({
  onSubmit,
  formRef,
  dateFormatter = 'string',
  search: propsSearch,
  type,
  form: formConfig = {},
  onReset,
}: TableFormItem<T>) => {
  /**
   * In order to support the disappearance of dom, this api is supported
   */
  const intl = useIntl();

  const [form] = Form.useForm();
  const formInstanceRef = useRef<
    Omit<FormInstance, 'scrollToField' | '__INTERNAL__'> | undefined
  >();
  const searchConfig = getDefaultSearch(propsSearch, intl, type === 'form');
  const { span } = searchConfig;

  const counter = Container.useContainer();
  const [collapse, setCollapse] = useMergeValue<boolean>(true, {
    value: searchConfig.collapsed,
    onChange: searchConfig.onCollapse,
  });
  const [proColumnsMap, setProColumnsMap] = useState<{
    [key: string]: ProColumns<any>;
  }>({});

  const windowSize = useMediaQuery();
  const [colSize, setColSize] = useState(getSpanConfig(span || 8, windowSize));
  const [formHeight, setFormHeight] = useState<number | undefined>(88);
  const rowNumber = 24 / colSize || 3;

  const isForm = type === 'form';

  /**
   *Submit the form, the method is different according to the two modes
   */
  const submit = async () => {
    // If it is not in form mode, no verification is required
    if (!isForm) {
      const value = form.getFieldsValue();
      if (onSubmit) {
        onSubmit(conversionValue(value, dateFormatter, proColumnsMap) as T);
      }
      return;
    }
    try {
      const value = await form.validateFields();
      if (onSubmit) {
        onSubmit(conversionValue(value, dateFormatter, proColumnsMap) as T);
      }
    } catch (error) {
      // console.log(error)
    }
  };

  useEffect(() => {
    if (!formRef) {
      return;
    }
    if (typeof formRef === 'function') {
      formRef(form);
    }
    if (formRef && typeof formRef !== 'function') {
      // eslint-disable-next-line no-param-reassign
      formRef.current = {
        ...form,
        submit: () => {
          submit();
          form.submit();
        },
      };
    }
  }, []);

  useEffect(() => {
    setColSize(getSpanConfig(span || 8, windowSize));
  }, [windowSize]);

  useDeepCompareEffect(() => {
    const tempMap = {};
    counter.proColumns.forEach((item) => {
      tempMap[genColumnKey(item.key, item.dataIndex, item.index) || 'null'] = item;
    });
    setProColumnsMap(tempMap);
  }, [counter.proColumns]);

  const columnsList = counter.proColumns
    .filter((item) => {
      const { valueType } = item;
      if (item.hideInSearch && type !== 'form') {
        return false;
      }
      if (type === 'form' && item.hideInForm) {
        return false;
      }
      if (
        valueType !== 'index' &&
        valueType !== 'indexBorder' &&
        valueType !== 'option' &&
        (item.key || item.dataIndex)
      ) {
        return true;
      }
      return false;
    })
    .sort((a, b) => {
      if (a && b) {
        return (b.order || 0) - (a.order || 0);
      }
      if (a && a.order) {
        return -1;
      }
      if (b && b.order) {
        return 1;
      }
      return 0;
    });

  const colConfig = typeof span === 'number' ? { span } : span;

  // This is done to trigger a child node when the user modifies the input render
  const [, updateState] = React.useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const domList = formInstanceRef.current
    ? columnsList
        .map((item) =>
          proFormItemRender({
            isForm,
            formInstance: formInstanceRef.current,
            item,
            type,
            colConfig,
            intl,
          }),
        )
        .filter((_, index) => (collapse && type !== 'form' ? index < (rowNumber - 1 || 1) : true))
        .filter((item) => !!item)
    : [];

  return (
    <ConfigConsumer>
      {({ getPrefixCls }: ConfigConsumerProps) => {
        const className = getPrefixCls('pro-table-search');
        const formClassName = getPrefixCls('pro-table-form');
        return (
          <div
            className={classNames(className, {
              [formClassName]: isForm,
            })}
            style={
              isForm
                ? undefined
                : {
                    height: formHeight,
                  }
            }
          >
            <RcResizeObserver
              onResize={({ height }) => {
                if (type === 'form') {
                  return;
                }
                setFormHeight(height + 24);
              }}
            >
              <div>
                <Form
                  {...formConfig}
                  form={form}
                  onValuesChange={() => forceUpdate()}
                  initialValues={columnsList.reduce(
                    (pre, item) => {
                      const key = genColumnKey(item.key, item.dataIndex, item.index) || '';
                      if (item.initialValue) {
                        return {
                          ...pre,
                          [key]: item.initialValue,
                        };
                      }
                      return pre;
                    },
                    { ...formConfig.initialValues },
                  )}
                >
                  <Form.Item shouldUpdate noStyle>
                    {(formInstance) => {
                      setTimeout(() => {
                        formInstanceRef.current = formInstance;
                      }, 0);
                      return null;
                    }}
                  </Form.Item>
                  <Row gutter={16} justify="start">
                    <Form.Item label={isForm && ' '} shouldUpdate noStyle>
                      <>{domList}</>
                    </Form.Item>
                    <Col
                      {...colConfig}
                      offset={getOffset(domList.length, colSize)}
                      key="option"
                      className={classNames(`${className}-option`, {
                        [`${className}-form-option`]: isForm,
                      })}
                    >
                      <Form.Item label={isForm && ' '}>
                        <FormOption
                          showCollapseButton={columnsList.length > rowNumber - 1 && !isForm}
                          searchConfig={searchConfig}
                          submit={submit}
                          onReset={onReset}
                          form={{
                            ...form,
                            submit: () => {
                              submit();
                              form.submit();
                            },
                          }}
                          type={type}
                          collapse={collapse}
                          setCollapse={setCollapse}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </div>
            </RcResizeObserver>
          </div>
        );
      }}
    </ConfigConsumer>
  );
};

export default FormSearch;
