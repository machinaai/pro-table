---
title: Value type
order: 7
sidemenu: false
nav:
  title: Default value type
  order: 5
---

# Value type

Pro-Table encapsulates some common value types to reduce repeated `render` operations. Configuring a`valueType` can display the formatted response data.

## valueType

The supported values ​​are as follows

| Type | Description | Examples |
| --- | --- | --- |
| money | Conversion value is amount | ¥ 10,000.26 |
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
| percent | percentage | +1.12 |

## Pass in function

A single value does not represent many types, and `progress` is a good example. So we support passing in a function. You can use it like this:

```tsxpure
const columns = {
  title: 'Progress',
  key: 'progress',
  dataIndex: 'progress',
  valueType: (item: T) => ((
    type: 'progress',
    status: item.status! == 'error'? 'active': 'exception',
  }),
};
```

### Supported return values

#### progress

```js
return { type: 'progress', status: 'success' | 'exception' | 'normal' | 'active' };
```

### money

```js
return { type: 'money', locale: 'en-Us' };
```

### percent

```js
return { type: 'percent', showSymbol: true | false, precision: 2 };
```

## valueEnum

valueEnum needs to pass in an enumeration, Pro-Table will automatically obtain the enumeration of the response based on the value, and generate a drop-down box in from It looks like this:

```ts | pure
const valueEnum = {
  open: {
    text: 'unsolved',
    status: 'Error',
  },
  closed: {
    text: 'solved',
    status: 'Success',
  },
};

// Can also be set as a function
const valueEnum = (row) =>
  row.isMe
    ? {
        open: {
          text: 'unsolved',
          status: 'Error',
        },
        closed: {
          text: 'solved',
          status: 'Success',
        },
      }
    : {
        open: {
          text: 'Waiting for solution',
          status: 'Error',
        },
        closed: {
          text: 'Resolved',
          status: 'Success',
        },
      };
```

> It is worth noting here that there is no row in from, so a null is passed in, and you can use this to determine what options to display in from.

## Examples

### Date class

<code src="./demo/valueTypeDate.tsx" />

### Digital

<code src="./demo/valueTypeNumber.tsx" />

### Style class

<code src="./demo/valueType.tsx" />
