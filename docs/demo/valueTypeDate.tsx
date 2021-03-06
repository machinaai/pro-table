import React from 'react';
import ProTable from '@machinaai/pro-table';

const valueEnum = {
  0: 'close',
  1: 'running',
  2: 'online',
  3: 'error',
};

export interface TableListItem {
  key: number;
  name: string;
  status: string;
  updatedAt: number;
  createdAt: number;
  progress: number;
  money: number;
  percent: number | string;
  createdAtRange: number[];
  code: string;
}
const tableListDataSource: TableListItem[] = [];

for (let i = 0; i < 2; i += 1) {
  tableListDataSource.push({
    key: i,
    name: `TradeCode ${i}`,
    status: valueEnum[Math.floor(Math.random() * 10) % 4],
    updatedAt: Date.now() - Math.floor(Math.random() * 1000),
    createdAt: Date.now() - Math.floor(Math.random() * 2000),
    createdAtRange: [
      Date.now() - Math.floor(Math.random() * 2000),
      Date.now() - Math.floor(Math.random() * 2000),
    ],
    money: Math.floor(Math.random() * 2000) * i,
    progress: Math.ceil(Math.random() * 100) + 1,
    percent:
      Math.random() > 0.5
        ? ((i + 1) * 10 + Math.random()).toFixed(3)
        : -((i + 1) * 10 + Math.random()).toFixed(2),
    code: `const getData = async params => {
  const data = await getData(params);
  return { list: data.data, ...data };
};`,
  });
}

export default () => (
  <>
    <ProTable<TableListItem>
      columns={[
        {
          title: 'Creation time',
          key: 'since',
          dataIndex: 'createdAt',
          valueType: 'dateTime',
        },
        {
          title: 'Date Range',
          key: 'dateRange',
          dataIndex: 'createdAtRange',
          valueType: 'dateRange',
        },
        {
          title: 'Date Time Range',
          key: 'dateTimeRange',
          dataIndex: 'createdAtRange',
          valueType: 'dateTimeRange',
        },
        {
          title: 'Update time',
          key: 'since2',
          dataIndex: 'createdAt',
          valueType: 'date',
        },
        {
          title: 'Closing time',
          key: 'since3',
          dataIndex: 'updatedAt',
          valueType: 'time',
        },
      ]}
      request={() => {
        return Promise.resolve({
          total: 200,
          data: tableListDataSource,
          success: true,
        });
      }}
      rowKey="key"
      headerTitle="Date class"
    />
  </>
);
