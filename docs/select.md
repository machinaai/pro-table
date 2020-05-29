---
title: Bulk operations
order: 6
sidemenu: false
nav:
  title: Bulk operations
  order: 5
---

# Bulk operations

Like antd, batch operations need to be set to start with `rowSelection`. Unlike antd, pro-table provides an alert to carry some information. You can customize it through `tableAlertRender`. Set or return false to close.

## Related API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| tableAlertRender | Render alert when configured `rowSelection`turn on. | `(keys:string[],rows:T[]) => React.ReactNode[]` | `chosen ${selectedRowKeys.length} item` |
| rowSelection | Whether the table row can be selected,[Configuration item](https://ant.design/components/table-cn/#rowSelection) | object | false |

## Demo

<code src="./demo/batchOption.tsx" />
