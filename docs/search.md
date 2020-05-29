---
title: Search form
order: 8
sidemenu: false
nav:
  title: Search form
  order: 2
---

# Table Search

Pro-Table will generate a Form based on the columns to filter the list data, and the final value will be returned according to the first parameter passed through `request`, which looks like.

```jsx | pure
<ProTable request={(params)=>{ all params}}>
```

According to the specification, the table form does not require any required parameters. All clicks on search and reset will trigger `request` to initiate a query.

Form's columns are generated according to `valueType`.

> ValueType is index indexBorder option and columns without dataIndex and key will be ignored.

| Type | Description |
| --- | --- |
| text | input |
| date | [DatePicker](https://ant.design/components/date-picker-cn/) |
| dateTime | [DatePicker](https://ant.design/components/date-picker-cn/#components-date-picker-demo-time) |
| time | [TimePicker](https://ant.design/components/time-picker-cn/) |
| money | inputNumber |

A column with `valueEnum` set will generate a Select. Select will automatically insert an all option and it is selected by default, but the value`all` will be discarded during query.

## Related API

### Pro-Table

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| onLoad | Triggered after the data is loaded, it will be triggered multiple times | `(dataSource: T[]) => void` | - |
| onRequestError | Triggered when data loading fails | `(e: Error) => void` | - |
| beforeSearchSubmit | Make some modifications before searching | `(params:T)=>T` | - |
| search | Whether to display the search form, the configuration of the search form when the object is passed in | `boolean \| { span?: number \| DefaultColConfig,searchText?: string, resetText?: string, collapseRender?: (collapsed: boolean) => React.ReactNode, collapsed:boolean, onCollapse: (collapsed:boolean)=> void }` | true |
| dateFormatter | The format of moment is converted to string by default | `"string" \| "number" \| false` | string |

### search

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| searchText | Search button text | string | Search |
| resetText | Reset button text | string | Reset |
| submitText | Submit button text | string | Reset |
| collapseRender | Collapse button render | `(collapsed: boolean,showCollapseButton?: boolean,) => React.ReactNode` | - |
| collapsed | Whether is collapsed | boolean | - |
| onCollapse | Collapse button event | `(collapsed: boolean) => void;` | - |
| optionRender | Option Bar render | `(( searchConfig: Omit<SearchConfig, 'optionRender'>, props: Omit<FormOptionProps, 'searchConfig'>, ) => React.ReactNode) \| false;` | - |

### Columns

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| valueEnum | Enumeration of values will automatically convert the value as a key to retrieve the content to be displayed | [valueEnum](#valueEnum) | - |
| valueType | Type of value | `'money' \| 'option' \| 'date' \| 'dateTime' \| 'time' \| 'text'\| 'index' \| 'indexBorder'` | 'text' |
| hideInSearch | Do not show this item in the query form | boolean | - |
| hideInTable | Do not show this column in Table | boolean | - |
| renderFormItem | Input component for rendering search form | `(item,props:{value,onChange}) => React.ReactNode` | - |

## Basic usage

<code src="./demo/search.tsx" />

## Option bar

<code src="./demo/search_option.tsx" />

## Form linkage

<code src="./demo/linkage_form.tsx" />
