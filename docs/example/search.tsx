import React, { useState } from 'react';
import { Input } from 'antd';
import ProTable, { ProColumns } from '@machinaai/pro-table';

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
}
const tableListDataSource: TableListItem[] = [];

for (let i = 0; i < 100; i += 1) {
  tableListDataSource.push({
    key: i,
    name: `TradeCode ${i}`,
    status: valueEnum[Math.floor(Math.random() * 10) % 4],
    updatedAt: Date.now() - Math.floor(Math.random() * 1000),
    createdAt: Date.now() - Math.floor(Math.random() * 2000),
    money: Math.floor(Math.random() * 2000) * i,
    progress: Math.ceil(Math.random() * 100) + 1,
  });
}

const columns: ProColumns<TableListItem>[] = [
  {
    title: 'title',
    dataIndex: 'name',
    render: (_) => <a>{_}</a>,
  },
  {
    title: 'status',
    dataIndex: 'status',
    initialValue: 'all',
    width: 100,
    valueEnum: {
      all: { text: 'All', status: 'Default' },
      close: { text: 'Closed', status: 'Default' },
      running: { text: 'Running', status: 'Processing' },
      online: { text: 'Online', status: 'Success' },
      error: { text: 'Error', status: 'Error' },
    },
  },
  {
    title: 'Creation Time',
    key: 'since',
    dataIndex: 'createdAt',
    width: 200,
    valueType: 'dateTime',
  },
  {
    title: 'Update Time',
    key: 'since2',
    width: 120,
    dataIndex: 'createdAt',
    valueType: 'date',
  },

  {
    title: 'Option',
    key: 'option',
    width: 120,
    valueType: 'option',
    render: () => [<a>Option</a>, <a>Delete</a>],
  },
];

export default () => {
  const [keyWord, setKeyWord] = useState<string>();
  return (
    <ProTable<TableListItem, { keyWord?: string }>
      columns={columns}
      request={(params = {}) =>
        Promise.resolve({
          data: tableListDataSource.filter((item) => {
            if (!params.keyWord) {
              return true;
            }
            if (item.name.includes(params.keyWord) || item.status.includes(params.keyWord)) {
              return true;
            }
            return false;
          }),
          success: true,
        })
      }
      rowKey="key"
      pagination={{
        showSizeChanger: true,
      }}
      size="middle"
      params={{ keyWord }}
      search={false}
      dateFormatter="string"
      headerTitle="Search"
      toolBarRender={() => [
        <Input.Search placeholder="Enter Here" onSearch={(value) => setKeyWord(value)} />,
      ]}
    />
  );
};
