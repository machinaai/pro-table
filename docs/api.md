---
title: API
order: 9
sidemenu: false
nav:
  title: API
  order: 2
---

# API

pro-table has a layer of encapsulation on antd's table, supports some presets, and encapsulates some behaviors. Only the apis different from antd table are listed here.

## Table

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| request | A method to get the dataSource | `(params ?: {pageSize: number; current: number; [key: string]: any;}) => Promise <RequestData <T >>` | - |
| postData | Do some processing on the data obtained through url | `(data: T []) => T []` | - |
| defaultData | default data | `T []` | - |
| actionRef | get table action | `React.MutableRefObject <ActionType> \| ((actionRef: ActionType) => void)` | - |
| toolBarRender | Rendering toolbar, support returning a dom array, will automatically increase margin-right | `(action: UseFetchDataAction <RequestData <T >>) => React.ReactNode []` | - |
| onLoad | Triggered after data loading is complete, will be triggered multiple times | `(dataSource: T[]) => void` | - |
| onRequestError | triggered when data loading fails | `(e: Error) => void` | - |
| tableClassName | className of the encapsulated table | string | - |
| tableStyle | style of the encapsulated table | CSSProperties | - |
| options | table's default operation, set to false to turn it off | `{{fullScreen: boolean \| function, reload: boolean \| function, setting: true}}` | `{fullScreen: true, reload: true, setting : true}` |
| search | Whether to display the search form, the configuration of the search form when passing in the object | `boolean \| {span ?: number \| DefaultColConfig, searchText ?: string, resetText ?: string, collapseRender ?: (collapsed: boolean) = > React.ReactNode, collapsed: boolean, onCollapse: (collapsed: boolean) => void}` | true |
| dateFormatter | moment formatting | `" string "\|" number "\| false` | string |
| beforeSearchSubmit | make some changes before searching | `(params: T) => T` | - |
| onSizeChange | table size changed | `(size: 'default' | 'middle' | 'small' | undefined) => void` | - |
| columnsStateMap | column state enumeration | `{[key: string]: {show: boolean, fixed:" right "|" left "}}`-- |
| onColumnsStateChange | columns state changed | `(props: {[key: string]: {show: boolean, fixed:" right "|" left "}}) => void` | - |
| type | pro-table Types of | `"form"` | - |
| form | antd form Configuration | `FormProps` | - |
| onSubmit | Triggered when submitting the form | `(params: U) => void` | - |
| onReset | Fired when the form is reset | `() => void` | - |
| columnEmptyText | Display when empty | `"string" \| false` | false |

### search

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| searchText | Search button text | string | Search |
| resetText | Reset button text | string | Reset |
| submitText | Submit button text | string | Submit |
| collapseRender | Collapse button render | `(collapsed: boolean,showCollapseButton?: boolean,) => React.ReactNode` | - |
| collapsed | If its Collapsed | boolean | - |
| onCollapse | Collapse button event | `(collapsed: boolean) => void;` | - |
| optionRender | Option render | `(( searchConfig: Omit<SearchConfig, 'optionRender'>, props: Omit<FormOptionProps, 'searchConfig'>, ) => React.ReactNode) \| false;` | - |

## Columns

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| renderText | Similar to the render of table, but must return a string. If you just want to convert the enum, you can use [valueEnum] (# valueEnum) | `(text: any, record: T, index: number, action: UseFetchDataAction <RequestData < T >>) => string` | - |
| render | Similar to the render of table, the first parameter becomes dom, and the fourth parameter is added. action ) => React.ReactNode \  | React.ReactNode [] `|- |
| renderFormItem | input component for rendering query form | `(item, props: {value, onChange}) => React.ReactNode` | - |
| ellipsis | whether to automatically shrink | boolean | - |
| copyable | whether to support copying | boolean | - |
| valueEnum | The enumeration of values ​​will automatically convert the value as a key to get the content to be displayed | [valueEnum] (# valueEnum) | - |
| valueType | value type | `'money' \| 'option' \| 'date' \| 'dateTime' \| 'time' \| 'text' \| 'index' \| 'indexBorder'` | ' text ' |
| hideInSearch | Do not show this item in the query form | boolean | - |
| hideInTable | Do not show this column in Table | boolean | - |
| hideInForm | Do not show this column in Form mode | boolean | - |
| order | Determines the order in the query form, the larger the more the first | number | - |
| formItemProps | The props of the query form will be passed to the form items | `{[prop: string]: any}` | - |

### ActionType

Sometimes we need to trigger table reload and other operations. Action can help us do this.

```tsx | pure
interface ActionType {
  reload: () => void;
  fetchMore: () => void;
  reset: () => void;
}

const ref = useRef<ActionType>();

<ProTable actionRef={ref} />;

// reload
ref.current.reload();

// load more
ref.current.fetchMore();

// reset to default
ref.current.reset();

// clear selected
ref.current.clearSelected();
```

## valueType

The supported values ​​are as follows

| Type | Description | Examples |
| --- | --- | --- |
| money | Conversion value is amount | ¥10,000.26 |
| date | Date | 2019-11-16 |
| dateRange | Date Range | 2019-11-16 2019-11-18 |
| dateTime | Date and Time | 2019-11-16 12:50:00 |
| dateTimeRange | Date and Time Range | 2019-11-16 12:50:00 2019-11-18 12:50:00 |
| time | time | 12:50:00 |
| option | The operation item will automatically increase the marginRight. It only supports an array. |
| text | Default value, no processing | - |
| textarea | Same as text, form will be converted to textarea component when converting | - |
| index | serial number | - |
| indexBorder | ordinal column with border | - |
| progress | progress bar | - |
| digit | Simple digit, which will be converted to inputNumber when form is converted | - |

## valueEnum

An enumeration of the current column values

```typescript | pure
interface IValueEnum {
  [key: string]:
    | React.ReactNode
    | {
        text: React.ReactNode;
        status: 'Success' | 'Error' | 'Processing' | 'Warning' | 'Default';
      };
}
```
