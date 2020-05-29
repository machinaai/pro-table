---
title: globalization
order: 8
sidemenu: false
nav:
  title: globalization
  order: 2
---

# globalization

ProTable has built-in support for internationalization. As a component with a relatively small amount of text, we can implement internationalization by ourselves with low cost.

## Code example

Full text

```typescript | prue
const enLocale = {
  tableFrom: {
    search: 'Query',
    reset: 'Reset',
    submit: 'Submit',
    collapsed: 'Expand',
    expand: 'Collapse',
    inputPlaceholder: 'Please enter',
    selectPlaceholder: 'Please select',
  },
  alert: {
    clear: 'Clear',
  },
  tableToolBar: {
    leftPin: 'Pin to left',
    rightPin: 'Pin to right',
    noPin: 'Unpinned',
    leftFixedTitle: 'Fixed the left',
    rightFixedTitle: 'Fixed the right',
    noFixedTitle: 'Not Fixed',
    reset: 'Reset',
    columnDisplay: 'Column Display',
    columnSetting: 'Settings',
    fullScreen: 'Full Screen',
    exitFullScreen: 'Exit Full Screen',
    reload: 'Refresh',
    density: 'Density',
    densityDefault: 'Default',
    densityLarger: 'Larger',
    densityMiddle: 'Middle',
    densitySmall: 'Compact',
  },
};

// Generate intl object
const enUSIntl = createIntl('en_US', enUS);

// use
<IntlProvider value={enUSIntl}>
  <ProTable />
</IntlProvider>;
```

# Demo List

<code src="./example/intl.tsx" />
