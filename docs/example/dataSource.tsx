import React, { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
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

for (let i = 0; i < 20; i += 1) {
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
    title: 'Index',
    dataIndex: 'index',
    valueType: 'index',
    width: 80,
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
    title: 'progress',
    key: 'progress',
    dataIndex: 'progress',
    valueType: (item) => ({
      type: 'progress',
      status: item.status !== 'error' ? 'active' : 'exception',
    }),
    width: 200,
  },
  {
    title: 'Update Time',
    key: 'since2',
    width: 120,
    dataIndex: 'createdAt',
    valueType: 'date',
  },
];

export default () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<TableListItem[]>([]);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      setDataSource(tableListDataSource);
    }, 5000);
  }, []);

  return (
    <ProTable<TableListItem>
      columns={columns}
      rowKey="key"
      pagination={{
        showSizeChanger: true,
      }}
      loading={loading}
      dataSource={dataSource}
      options={{
        density: true,
        reload: () => {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        },
        fullScreen: true,
        setting: true,
      }}
      dateFormatter="string"
      headerTitle="dataSource loading"
      toolBarRender={() => [
        <Button key="3" type="primary">
          <PlusOutlined />
          New
        </Button>,
      ]}
    />
  );
};
