import React, { useRef, useState } from 'react';
import { Button } from 'antd';
import ProTable, { ProColumns } from '@machinaai/pro-table';
import { FormInstance } from 'antd/lib/form';

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
  },
  {
    title: 'status',
    dataIndex: 'status',
    initialValue: 'all',
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
    valueType: 'dateTime',
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
  const ref = useRef<FormInstance>();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ProTable<TableListItem>
      columns={columns}
      request={() =>
        Promise.resolve({
          data: tableListDataSource,
          success: true,
        })
      }
      rowKey="key"
      pagination={{
        showSizeChanger: true,
      }}
      search={{
        collapsed,
        onCollapse: setCollapsed,
      }}
      formRef={ref}
      toolBarRender={() => [
        <Button
          onClick={() => {
            if (ref.current) {
              ref.current.setFieldsValue({
                name: 'test-one',
              });
            }
          }}
        >
          Task
        </Button>,
      ]}
      dateFormatter="string"
      headerTitle="Form Submit"
    />
  );
};
