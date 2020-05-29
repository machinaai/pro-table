import { render } from 'enzyme';
import React from 'react';
import { Input } from 'antd';
import ProTable, { TableDropdown } from '../../src/index';
import { columns, request } from './demo';

describe('BasicTable', () => {
  it('🎏 base use', () => {
    const html = render(
      <ProTable
        size="small"
        columns={columns}
        request={request}
        rowKey="key"
        params={{ keyword: 'test' }}
        pagination={{
          defaultCurrent: 10,
        }}
        toolBarRender={(action) => [
          <Input.Search
            style={{
              width: 200,
            }}
          />,
          <TableDropdown.Button
            menus={[
              { key: 'copy', name: 'copy' },
              { key: 'clear', name: 'clear' },
            ]}
          >
            More operations
          </TableDropdown.Button>,
        ]}
      />,
    );
    expect(html).toMatchSnapshot();
  });

  it('🎏 do not render Search ', () => {
    const html = render(
      <ProTable
        size="small"
        columns={columns}
        request={request}
        rowKey="key"
        search={false}
        params={{ keyword: 'test' }}
        pagination={{
          defaultCurrent: 10,
        }}
      />,
    );
    expect(html).toMatchSnapshot();
  });

  it('🎏  do not render default option', () => {
    const html = render(
      <ProTable
        size="small"
        options={{
          fullScreen: false,
          reload: false,
          setting: false,
        }}
        columns={[
          {
            dataIndex: 'money',
            valueType: 'money',
          },
        ]}
        request={request}
        rowKey="key"
      />,
    );
    expect(html).toMatchSnapshot();
  });

  it('🎏  do not render setting', () => {
    const html = render(
      <ProTable
        size="small"
        options={{
          fullScreen: true,
          reload: true,
          setting: false,
        }}
        columns={[
          {
            dataIndex: 'money',
            valueType: 'money',
          },
        ]}
        request={request}
        rowKey="key"
      />,
    );
    expect(html).toMatchSnapshot();
  });
});
