import React, { useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Drawer, Tag } from 'antd';
import ProTable, { ProColumns, TableDropdown, ActionType } from '@machinaai/pro-table';
import request from 'umi-request';

interface GithubIssueItem {
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  id: number;
  node_id: string;
  number: number;
  title: string;
  user: User;
  labels: Label[];
  state: string;
  locked: boolean;
  assignee?: any;
  assignees: any[];
  milestone?: any;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at?: any;
  author_association: string;
  body: string;
}

interface Label {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  default: boolean;
  description: string;
}

interface User {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

const columns: ProColumns<GithubIssueItem>[] = [
  {
    title: 'Index',
    dataIndex: 'index',
    valueType: 'indexBorder',
    width: 72,
  },
  {
    title: 'Title',
    dataIndex: 'title',
    copyable: true,
    ellipsis: true,
    rules: [
      {
        required: true,
        message: 'Required',
      },
    ],
    width: 200,
    hideInSearch: true,
  },
  {
    title: 'Status',
    dataIndex: 'state',
    initialValue: 'all',
    valueEnum: {
      all: { text: 'All', status: 'Default' },
      open: {
        text: 'unsolved',
        status: 'Error',
      },
      closed: {
        text: 'solved',
        status: 'Success',
      },
    },
  },
  {
    title: 'Label',
    dataIndex: 'labels',
    width: 120,
    render: (_, row) =>
      row.labels.map(({ name, id, color }) => (
        <Tag
          color={`#${color}`}
          key={id}
          style={{
            margin: 4,
          }}
        >
          {name}
        </Tag>
      )),
  },
  {
    title: 'Creation Time',
    key: 'since',
    dataIndex: 'created_at',
    valueType: 'dateTime',
    hideInForm: true,
  },
  {
    title: 'option',
    valueType: 'option',
    render: (text, row, _, action) => [
      <a href={row.html_url} target="_blank" rel="noopener noreferrer">
        View
      </a>,
      <TableDropdown
        onSelect={() => action.reload()}
        menus={[
          { key: 'copy', name: 'copy' },
          { key: 'delete', name: 'delete' },
        ]}
      />,
    ],
  },
];

export default () => {
  const actionRef = useRef<ActionType>();
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Drawer width={600} onClose={() => setVisible(false)} visible={visible}>
        <Button
          style={{
            margin: 8,
          }}
          onClick={() => {
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        >
          Refresh
        </Button>
        <Button
          onClick={() => {
            if (actionRef.current) {
              actionRef.current.reset();
            }
          }}
        >
          Reset
        </Button>
        <ProTable<GithubIssueItem>
          columns={columns}
          type="form"
          onSubmit={(params) => console.log(params)}
        />
      </Drawer>
      <ProTable<GithubIssueItem>
        columns={columns}
        actionRef={actionRef}
        request={async (params = {}) => {
          const data = await request<GithubIssueItem[]>(
            'https://api.github.com/repos/machinaai/react-design/issues',
            {
              params: {
                ...params,
                page: params.current,
                per_page: params.pageSize,
              },
            },
          );
          const totalObj = await request(
            'https://api.github.com/repos/machinaai/react-design/issues?per_page=1',
            {
              params,
            },
          );
          return {
            data,
            page: params.current,
            success: true,
            total: ((totalObj[0] || { number: 0 }).number - 56) as number,
          };
        }}
        rowKey="id"
        dateFormatter="string"
        headerTitle="Search Table"
        toolBarRender={() => [
          <Button key="3" type="primary">
            <PlusOutlined />
            New
          </Button>,
        ]}
      />
    </>
  );
};
