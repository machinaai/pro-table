import React from 'react';
import ProTable, { ProColumns } from '@machinaai/pro-table';
import { Space } from 'antd';

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
  avatar: string;
}
const tableListDataSource: TableListItem[] = [];

for (let i = 0; i < 2; i += 1) {
  tableListDataSource.push({
    key: i,
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
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

const columns: ProColumns<TableListItem>[] = [
  {
    title: 'index',
    dataIndex: 'index',
    valueType: 'index',
    width: 72,
  },
  {
    title: 'border index',
    dataIndex: 'index',
    key: 'indexBorder',
    valueType: 'indexBorder',
    width: 72,
  },
  {
    title: 'status',
    dataIndex: 'status',
    initialValue: 'all',
    width: 100,
    ellipsis: true,
    valueEnum: {
      all: { text: 'All', status: 'Default' },
      close: { text: 'close', status: 'Default' },
      running: { text: 'running', status: 'Processing' },
      online: { text: 'online', status: 'Success' },
      error: { text: 'error', status: 'Error' },
    },
  },
  {
    title: 'Code',
    key: 'code',
    width: 120,
    dataIndex: 'code',
    valueType: 'code',
  },
  {
    title: 'Avatar',
    dataIndex: 'avatar',
    key: 'avatar',
    valueType: 'avatar',
    width: 150,
    render: (dom) => (
      <Space>
        <span>{dom}</span>
        <a href="https://github.com/chenshuai2144" target="_blank" rel="noopener noreferrer">
          chenshuai2144
        </a>
      </Space>
    ),
  },
  {
    title: 'Option',
    key: 'option',
    width: 120,
    valueType: 'option',
    render: () => [<a>Option</a>, <a>Delete</a>],
  },
];

export default () => (
  <>
    <ProTable<TableListItem>
      columns={columns}
      request={(params) => {
        console.log(params);
        return Promise.resolve({
          total: 200,
          data: tableListDataSource,
          success: true,
        });
      }}
      rowKey="key"
      headerTitle="Style class"
    />
  </>
);
