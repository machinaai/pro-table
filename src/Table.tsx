import './index.less';

import React, { useEffect, CSSProperties, useRef, useState, ReactNode } from 'react';
import { Table, ConfigProvider, Card, Space, Typography, Empty, Tooltip } from 'antd';
import classNames from 'classnames';
import useMergeValue from 'use-merge-value';
import { stringify } from 'use-json-comparison';
import { ColumnsType, TablePaginationConfig, TableProps, ColumnType } from 'antd/es/table';
import { FormItemProps, FormProps, FormInstance } from 'antd/es/form';
import { ConfigConsumer, ConfigConsumerProps } from 'antd/lib/config-provider';

import { IntlProvider, IntlConsumer, IntlType } from './component/intlContext';
import useFetchData, { UseFetchDataAction, RequestData } from './useFetchData';
import Container from './container';
import Toolbar, { OptionConfig, ToolBarProps } from './component/toolBar';
import Alert from './component/alert';
import FormSearch, { SearchConfig, TableFormItem } from './Form';
import { StatusType } from './component/status';

import get, {
  parsingText,
  parsingValueEnumToArray,
  checkUndefinedOrNull,
  useDeepCompareEffect,
  genColumnKey,
} from './component/util';
import defaultRenderText, {
  ProColumnsValueType,
  ProColumnsValueTypeFunction,
} from './defaultRender';
import { DensitySize } from './component/toolBar/DensityIcon';
import ErrorBoundary from './component/ErrorBoundary';

type TableRowSelection = TableProps<any>['rowSelection'];

export interface ActionType {
  reload: (resetPageIndex?: boolean) => void;
  fetchMore: () => void;
  reset: () => void;
  clearSelected: () => void;
}

export interface ColumnsState {
  show?: boolean;
  fixed?: 'right' | 'left' | undefined;
}

export interface ProColumnType<T = unknown>
  extends Omit<ColumnType<T>, 'render' | 'children'>,
    Partial<Omit<FormItemProps, 'children'>> {
  index?: number;
  /**
   * customize render
   */
  render?: (
    text: React.ReactNode,
    record: T,
    index: number,
    action: UseFetchDataAction<RequestData<T>>,
  ) => React.ReactNode | React.ReactNode[];

  /**
   * Custom render, but need to return string
   */
  renderText?: (
    text: any,
    record: T,
    index: number,
    action: UseFetchDataAction<RequestData<T>>,
  ) => any;

  /**
   * Custom search form input
   */
  renderFormItem?: (
    item: ProColumns<T>,
    config: {
      value?: any;
      onChange?: (value: any) => void;
      type: ProTableTypes;
      defaultRender: (newItem: ProColumns<any>) => JSX.Element | null;
    },
    form: Omit<FormInstance, 'scrollToField' | '__INTERNAL__'>,
  ) => JSX.Element | false | null;

  /**
   * Search form props
   */
  formItemProps?: { [prop: string]: any };

  /**
   * Search form defaults
   */
  initialValue?: any;

  /**
   * Whether to abbreviate
   */
  ellipsis?: boolean;
  /**
   * Whether to copy
   */
  copyable?: boolean;

  /**
   * Type of value
   */
  valueType?: ProColumnsValueType | ProColumnsValueTypeFunction<T>;

  /**
   * Enumeration of values, if an enumeration exists, select will be generated in Search
   */
  valueEnum?: {
    [key: string]:
      | {
          text: ReactNode;
          status: StatusType;
        }
      | ReactNode;
  };

  /**
   * Hide in Search form
   */
  hideInSearch?: boolean;

  /**
   * Hide in table
   */
  hideInTable?: boolean;

  /**
   * Hide in new form
   */
  hideInForm?: boolean;

  /**
   * form Order
   */
  order?: number;
}

export interface ProColumnGroupType<RecordType> extends ProColumnType<RecordType> {
  children: ProColumns<RecordType>;
}

export type ProColumns<T> = ProColumnGroupType<T> | ProColumnType<T>;

// The modification of the table is not fully supported yet
export type ProTableTypes = 'form' | 'list' | 'table' | 'cardList' | undefined;

export interface ProTableProps<T, U extends { [key: string]: any }>
  extends Omit<TableProps<T>, 'columns' | 'rowSelection'> {
  columns?: ProColumns<T>[];

  params?: U;

  columnsStateMap?: {
    [key: string]: ColumnsState;
  };

  onColumnsStateChange?: (map: { [key: string]: ColumnsState }) => void;

  onSizeChange?: (size: DensitySize) => void;

  /**
   * A method to get the dataSource
   */
  request?: (
    params?: U & {
      pageSize?: number;
      current?: number;
    },
  ) => Promise<RequestData<T>>;

  /**
   * Do some processing on the data
   */
  postData?: (data: any[]) => any[];
  /**
   * Default data
   */
  defaultData?: T[];

  /**
   * Initialized parameters, can edit table
   */
  actionRef?: React.MutableRefObject<ActionType | undefined> | ((actionRef: ActionType) => void);
  formRef?: TableFormItem<T>['formRef'];
  /**
   * Render action bar
   */
  toolBarRender?: ToolBarProps<T>['toolBarRender'] | false;

  /**
   * Triggered after data loading is complete
   */
  onLoad?: (dataSource: T[]) => void;

  /**
   * Fired when data loading fails
   */
  onRequestError?: (e: Error) => void;

  /**
   * ClassName of the given table
   */
  tableClassName?: string;

  /**
   * Style for the wrapped table
   */
  tableStyle?: CSSProperties;

  /**
   * Title in upper left corner
   */
  headerTitle?: React.ReactNode;

  /**
   * Default action bar configuration
   */
  options?: OptionConfig<T> | false;
  /**
   * Whether to display the search form
   */
  search?: boolean | SearchConfig;

  /**
   * Type = "form" and the form configuration of the search form
   * The basic configuration is the same as antd Form
   * But hijacked the configuration of form
   */
  form?: Omit<FormProps, 'form'>;
  /**
   * How to format the date
   * Currently only supports
   * string Will be formatted as YYYY-DD-MM
   * number Representative timestamp
   */
  dateFormatter?: 'string' | 'number' | false;
  /**
   * Format the search form to submit data
   */
  beforeSearchSubmit?: (params: Partial<T>) => Partial<T>;
  /**
   * Custom table alert
   * Set or return false to close
   */
  tableAlertRender?:
    | ((props: {
        intl: IntlType;
        selectedRowKeys: (string | number)[];
        selectedRows: T[];
      }) => React.ReactNode)
    | false;
  /**
   * Customize the alert operation of the table
   * Set or return false to close
   */
  tableAlertOptionRender?:
    | ((props: { intl: IntlType; onCleanSelected: () => void }) => React.ReactNode)
    | false;

  rowSelection?: TableProps<T>['rowSelection'] | false;

  style?: React.CSSProperties;

  /**
   * Supported ProTable types
   */
  type?: ProTableTypes;

  /**
   * Fired when the form is submitted
   */
  onSubmit?: (params: U) => void;

  /**
   * Fired when the form is reset
   */
  onReset?: () => void;

  /**
   * Display when empty
   */
  columnEmptyText?: ColumnEmptyText;
}

const mergePagination = <T extends any[], U>(
  pagination: TablePaginationConfig | boolean | undefined = {},
  action: UseFetchDataAction<RequestData<T>>,
): TablePaginationConfig | false | undefined => {
  if (pagination === false) {
    return {};
  }
  let defaultPagination: TablePaginationConfig | {} = pagination || {};
  const { current, pageSize } = action;
  if (pagination === true) {
    defaultPagination = {};
  }
  return {
    showTotal: (all, range) => `First ${range[0]}-${range[1]} Article / Total ${all} article`,
    showSizeChanger: true,
    total: action.total,
    ...(defaultPagination as TablePaginationConfig),
    current,
    pageSize,
    onChange: (page: number, newPageSize?: number) => {
      // pageSize After the change, there is no need to switch the page number
      if (newPageSize !== pageSize && current !== page) {
        action.setPageInfo({ pageSize, page });
      } else {
        if (newPageSize !== pageSize) {
          action.setPageInfo({ pageSize });
        }
        if (current !== page) {
          action.setPageInfo({ page });
        }
      }

      const { onChange } = pagination as TablePaginationConfig;
      if (onChange) {
        onChange(page, newPageSize || 20);
      }
    },

    onShowSizeChange: (page: number, showPageSize: number) => {
      action.setPageInfo({
        pageSize: showPageSize,
        page,
      });
      const { onShowSizeChange } = pagination as TablePaginationConfig;
      if (onShowSizeChange) {
        onShowSizeChange(page, showPageSize || 20);
      }
    },
  };
};

export type ColumnEmptyText = string | false;

interface ColumRenderInterface<T> {
  item: ProColumns<T>;
  text: any;
  row: T;
  index: number;
  columnEmptyText?: ColumnEmptyText;
}

/**
 * Tooltip for generating Ellipsis
 * @param dom
 * @param item
 * @param text
 */
const genEllipsis = (dom: React.ReactNode, item: ProColumns<any>, text: string) => {
  if (!item.ellipsis) {
    return dom;
  }
  return (
    <Tooltip title={text}>
      <div>{dom}</div>
    </Tooltip>
  );
};

const genCopyable = (dom: React.ReactNode, item: ProColumns<any>) => {
  if (item.copyable || item.ellipsis) {
    return (
      <Typography.Paragraph
        style={{
          width: item.width && (item.width as number) - 32,
          margin: 0,
          padding: 0,
        }}
        copyable={item.copyable}
        ellipsis={item.ellipsis}
      >
        {dom}
      </Typography.Paragraph>
    );
  }
  return dom;
};

/**
 * This component is responsible for the specific rendering of the cell
 * @param param0
 */
const columRender = <T, U = any>({
  item,
  text,
  row,
  index,
  columnEmptyText,
}: ColumRenderInterface<T>): any => {
  const counter = Container.useContainer();
  const { action } = counter;
  const { renderText = (val: any) => val, valueEnum = {} } = item;
  if (!action.current) {
    return null;
  }

  const renderTextStr = renderText(parsingText(text, valueEnum), row, index, action.current);
  const textDom = defaultRenderText<T, {}>(
    renderTextStr,
    item.valueType || 'text',
    index,
    row,
    columnEmptyText,
  );

  const dom: React.ReactNode = genEllipsis(
    genCopyable(textDom, item),
    item,
    renderText(parsingText(text, valueEnum, true), row, index, action.current),
  );

  if (item.render) {
    const renderDom = item.render(dom, row, index, action.current);

    // If it is a merged cell, return the object directly
    if (
      renderDom &&
      typeof renderDom === 'object' &&
      (renderDom as { props: { colSpan: number } }).props &&
      (renderDom as { props: { colSpan: number } }).props.colSpan
    ) {
      return renderDom;
    }

    if (renderDom && item.valueType === 'option' && Array.isArray(renderDom)) {
      return <Space>{renderDom}</Space>;
    }
    return renderDom as React.ReactNode;
  }
  return checkUndefinedOrNull(dom) ? dom : null;
};

const genColumnList = <T, U = {}>(
  columns: ProColumns<T>[],
  map: {
    [key: string]: ColumnsState;
  },
  columnEmptyText?: ColumnEmptyText,
): (ColumnsType<T>[number] & { index?: number })[] =>
  (columns
    .map((item, columnsIndex) => {
      const { key, dataIndex } = item;
      const columnKey = genColumnKey(key, dataIndex, columnsIndex);
      const config = columnKey ? map[columnKey] || { fixed: item.fixed } : { fixed: item.fixed };
      const tempColumns = {
        onFilter: (value: string, record: T) => {
          let recordElement = get(record, item.dataIndex || '');
          if (typeof recordElement === 'number') {
            recordElement = recordElement.toString();
          }
          const itemValue = String(recordElement || '') as string;
          return String(itemValue) === String(value);
        },
        index: columnsIndex,
        filters: parsingValueEnumToArray(item.valueEnum).filter(
          (valueItem) => valueItem && valueItem.value !== 'all',
        ),
        ...item,
        ellipsis: false,
        fixed: config.fixed,
        width: item.width || (item.fixed ? 200 : undefined),
        // @ts-ignore
        children: item.children ? genColumnList(item.children, map, columnEmptyText) : undefined,
        render: (text: any, row: T, index: number) =>
          columRender<T>({ item, text, row, index, columnEmptyText }),
      };
      if (!tempColumns.children || !tempColumns.children.length) {
        delete tempColumns.children;
      }
      if (!tempColumns.dataIndex) {
        delete tempColumns.dataIndex;
      }
      if (!tempColumns.filters || !tempColumns.filters.length) {
        delete tempColumns.filters;
      }
      return tempColumns;
    })
    .filter((item) => !item.hideInTable) as unknown) as ColumnsType<T>[number] &
    {
      index?: number;
    }[];

/**
 * 🏆 Use Ant Design Table like a Pro!
 * Faster faster better more convenient
 * @param props
 */
const ProTable = <T extends {}, U extends object>(
  props: ProTableProps<T, U> & {
    defaultClassName: string;
  },
) => {
  const {
    request,
    className: propsClassName,
    params = {},
    defaultData = [],
    headerTitle,
    postData,
    pagination: propsPagination,
    actionRef,
    columns: propsColumns = [],
    toolBarRender = () => [],
    onLoad,
    onRequestError,
    style,
    tableStyle,
    tableClassName,
    columnsStateMap,
    onColumnsStateChange,
    options,
    search = true,
    rowSelection: propsRowSelection = false,
    beforeSearchSubmit = (searchParams: Partial<U>) => searchParams,
    tableAlertRender,
    defaultClassName,
    formRef,
    type = 'table',
    onReset = () => {},
    columnEmptyText = '-',
    ...rest
  } = props;

  const [selectedRowKeys, setSelectedRowKeys] = useMergeValue<React.ReactText[]>([], {
    value: propsRowSelection ? propsRowSelection.selectedRowKeys : undefined,
  });
  const [formSearch, setFormSearch] = useState<{}>({});
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [dataSource, setDataSource] = useState<T[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const fullScreen = useRef<() => void>();

  /**
   * It needs to be initialized, otherwise it may report an error by default
   * The defaultCurrent and current are taken here
   * To ensure that it will not be refreshed repeatedly
   */
  const fetchPagination =
    typeof propsPagination === 'object'
      ? (propsPagination as TablePaginationConfig)
      : { defaultCurrent: 1, defaultPageSize: 20, pageSize: 20, current: 1 };

  const action = useFetchData(
    async ({ pageSize, current }) => {
      if (!request) {
        return {
          data: props.dataSource || [],
          success: true,
        } as RequestData<T>;
      }
      const msg = await request({ current, pageSize, ...formSearch, ...params } as U);
      if (postData) {
        return { ...msg, data: postData(msg.data) };
      }
      return msg;
    },
    defaultData,
    {
      defaultCurrent: fetchPagination.current || fetchPagination.defaultCurrent,
      defaultPageSize: fetchPagination.pageSize || fetchPagination.defaultPageSize,
      onLoad,
      onRequestError,
      effects: [stringify(params), stringify(formSearch)],
    },
  );

  useEffect(() => {
    fullScreen.current = () => {
      if (!rootRef.current || !document.fullscreenEnabled) {
        return;
      }
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        rootRef.current.requestFullscreen();
      }
    };
  }, [rootRef.current]);

  action.fullScreen = fullScreen.current;

  const pagination = propsPagination !== false && mergePagination<T[], {}>(propsPagination, action);

  const counter = Container.useContainer();

  const onCleanSelected = () => {
    if (propsRowSelection && propsRowSelection.onChange) {
      propsRowSelection.onChange([], []);
    }
    setSelectedRowKeys([]);
    setSelectedRows([]);
  };

  useEffect(() => {
    // When the data source is updated, cancel all selected items
    onCleanSelected();
    setDataSource(request ? (action.dataSource as T[]) : props.dataSource || []);
  }, [props.dataSource, action.dataSource]);

  /**
   *  Save propsColumns
   *  Need to generate form
   */
  useDeepCompareEffect(() => {
    counter.setProColumns(propsColumns);
  }, [propsColumns]);

  counter.setAction(action);

  /**
   * The action mapping is generated here to ensure that the action is always the latest
   * Only need to render once
   */
  useEffect(() => {
    const userAction: ActionType = {
      reload: async (resetPageIndex?: boolean) => {
        const {
          action: { current },
        } = counter;
        if (!current) {
          return;
        }
        // After reload, there is a high probability that the data will be switched. Clear the selection
        setSelectedRowKeys([]);
        // If true, return to the first page
        if (resetPageIndex) {
          await current.resetPageIndex();
        }

        await current.reload();
      },
      fetchMore: async () => {
        const {
          action: { current },
        } = counter;
        if (!current) {
          return;
        }
        await current.fetchMore();
      },
      reset: () => {
        const {
          action: { current },
        } = counter;
        if (!current) {
          return;
        }
        current.reset();
      },
      clearSelected: onCleanSelected,
    };
    if (actionRef && typeof actionRef === 'function') {
      actionRef(userAction);
    }
    if (actionRef && typeof actionRef !== 'function') {
      actionRef.current = userAction;
    }
  }, []);

  /**
   * Update when the Table Column changes, this parameter will be used for rendering
   */
  useDeepCompareEffect(() => {
    const tableColumn = genColumnList<T>(propsColumns, counter.columnsMap, columnEmptyText);
    if (tableColumn && tableColumn.length > 0) {
      counter.setColumns(tableColumn);
      // Regenerate the key string for sorting
      counter.setSortKeyColumns(
        tableColumn.map((item, index) => {
          const key =
            genColumnKey(item.key, (item as ProColumnType).dataIndex, index) || `${index}`;
          return `${key}_${item.index}`;
        }),
      );
    }
  }, [propsColumns]);

  /**
   * Here is mainly for sorting, in order to ensure timely update, recalculate every time
   */
  useDeepCompareEffect(() => {
    const keys = counter.sortKeyColumns.join(',');
    let tableColumn = genColumnList<T>(propsColumns, counter.columnsMap, columnEmptyText);
    if (keys.length > 0) {
      // Sorting for visualization
      tableColumn = tableColumn.sort((a, b) => {
        const { fixed: aFixed, index: aIndex } = a;
        const { fixed: bFixed, index: bIndex } = b;
        if (
          (aFixed === 'left' && bFixed !== 'left') ||
          (bFixed === 'right' && aFixed !== 'right')
        ) {
          return -2;
        }
        if (
          (bFixed === 'left' && aFixed !== 'left') ||
          (aFixed === 'right' && bFixed !== 'right')
        ) {
          return 2;
        }
        // If there is no index, he will report an error when dataIndex or key does not exist
        const aKey = `${genColumnKey(a.key, (a as ProColumnType).dataIndex, aIndex)}_${aIndex}`;
        const bKey = `${genColumnKey(b.key, (b as ProColumnType).dataIndex, bIndex)}_${bIndex}`;
        return keys.indexOf(aKey) - keys.indexOf(bKey);
      });
    }
    if (tableColumn && tableColumn.length > 0) {
      counter.setColumns(tableColumn);
    }
  }, [counter.columnsMap, counter.sortKeyColumns.join('-')]);

  /**
   * Synchronous Pagination with controlled page numbers and pageSize
   */
  useDeepCompareEffect(() => {
    if (propsPagination && propsPagination.current && propsPagination.pageSize) {
      action.setPageInfo({
        pageSize: propsPagination.pageSize,
        page: propsPagination.current,
      });
    }
  }, [propsPagination]);

  // Map selectedRowKeys with selectedRow
  useEffect(() => {
    if (action.loading !== false || propsRowSelection === false) {
      return;
    }
    const tableKey = rest.rowKey;

    // dataSource maybe is a null
    // eg: api has 404 error
    const selectedRow = Array.isArray(dataSource)
      ? dataSource.filter((item, index) => {
          if (!tableKey) {
            return (selectedRowKeys as any).includes(index);
          }
          if (typeof tableKey === 'function') {
            const key = tableKey(item, index);
            return (selectedRowKeys as any).includes(key);
          }
          return (selectedRowKeys as any).includes(item[tableKey]);
        })
      : [];

    setSelectedRows(selectedRow);
  }, [selectedRowKeys.join('-'), action.loading, propsRowSelection === false]);

  const rowSelection: TableRowSelection = {
    selectedRowKeys,
    ...propsRowSelection,
    onChange: (keys, rows) => {
      if (propsRowSelection && propsRowSelection.onChange) {
        propsRowSelection.onChange(keys, rows);
      }
      setSelectedRowKeys(keys);
    },
  };

  useEffect(() => {
    counter.setTableSize(rest.size || 'middle');
  }, [rest.size]);

  if (counter.columns.length < 1) {
    return (
      <Card bordered={false} bodyStyle={{ padding: 50 }}>
        <Empty />
      </Card>
    );
  }

  const className = classNames(defaultClassName, propsClassName);
  return (
    <ConfigProvider
      getPopupContainer={() => ((rootRef.current || document.body) as any) as HTMLElement}
    >
      <div className={className} id="ant-design-pro-table" style={style} ref={rootRef}>
        {(search || type === 'form') && (
          <FormSearch<U>
            {...rest}
            type={props.type}
            formRef={formRef}
            onSubmit={(value) => {
              if (type !== 'form') {
                setFormSearch(
                  beforeSearchSubmit({
                    ...value,
                    _timestamp: Date.now(),
                  }),
                );
                // back first page
                action.resetPageIndex();
              }

              if (props.onSubmit) {
                props.onSubmit(value);
              }
            }}
            onReset={() => {
              setFormSearch(beforeSearchSubmit({}));
              // back first page
              action.resetPageIndex();
              onReset();
            }}
            dateFormatter={rest.dateFormatter}
            search={search}
          />
        )}

        {type !== 'form' && (
          <Card
            bordered={false}
            style={{
              height: '100%',
            }}
            bodyStyle={{
              padding: 0,
            }}
          >
            {toolBarRender !== false && (options !== false || headerTitle || toolBarRender) && (
              // if options= false & headerTitle=== false, hide Toolbar
              <Toolbar<T>
                options={options}
                headerTitle={headerTitle}
                action={action}
                selectedRows={selectedRows}
                selectedRowKeys={selectedRowKeys}
                toolBarRender={toolBarRender}
              />
            )}
            {propsRowSelection !== false && (
              <Alert<T>
                selectedRowKeys={selectedRowKeys}
                selectedRows={selectedRows}
                onCleanSelected={onCleanSelected}
                alertOptionRender={rest.tableAlertOptionRender}
                alertInfoRender={tableAlertRender}
              />
            )}
            <Table<T>
              {...rest}
              size={counter.tableSize}
              rowSelection={propsRowSelection === false ? undefined : rowSelection}
              className={tableClassName}
              style={tableStyle}
              columns={counter.columns.filter((item) => {
                // Delete what should not be displayed
                const { key, dataIndex } = item;
                const columnKey = genColumnKey(key, dataIndex);
                if (!columnKey) {
                  return true;
                }
                const config = counter.columnsMap[columnKey];
                if (config && config.show === false) {
                  return false;
                }
                return true;
              })}
              loading={action.loading || props.loading}
              dataSource={dataSource}
              pagination={pagination}
            />
          </Card>
        )}
      </div>
    </ConfigProvider>
  );
};

/**
 * 🏆 Use Ant Design Table like a Pro!
 * @param props
 */
const ProviderWarp = <T, U extends { [key: string]: any } = {}>(props: ProTableProps<T, U>) => (
  <Container.Provider initialState={props}>
    <ConfigConsumer>
      {({ getPrefixCls }: ConfigConsumerProps) => (
        <IntlConsumer>
          {(value) => (
            <IntlProvider value={value}>
              <ErrorBoundary>
                <ProTable defaultClassName={getPrefixCls('pro-table')} {...props} />
              </ErrorBoundary>
            </IntlProvider>
          )}
        </IntlConsumer>
      )}
    </ConfigConsumer>
  </Container.Provider>
);

export default ProviderWarp;
