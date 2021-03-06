import { useState, useEffect } from 'react';
import { usePrevious, useDebounceFn } from './component/util';

export interface RequestData<T> {
  data: T[];
  success?: boolean;
  total?: number;
  [key: string]: any;
}
export interface UseFetchDataAction<T extends RequestData<any>> {
  dataSource: T['data'] | T;
  loading: boolean | undefined;
  hasMore: boolean;
  current: number;
  pageSize: number;
  total: number;
  reload: () => Promise<void>;
  fetchMore: () => void;
  fullScreen?: () => void;
  resetPageIndex: () => void;
  reset: () => void;
  setPageInfo: (pageInfo: Partial<PageInfo>) => void;
}

interface PageInfo {
  hasMore: boolean;
  page: number;
  pageSize: number;
  total: number;
}

const useFetchData = <T extends RequestData<any>>(
  getData: (params: { pageSize: number; current: number }) => Promise<T>,
  defaultData?: Partial<T['data']>,
  options?: {
    defaultCurrent?: number;
    defaultPageSize?: number;
    effects?: any[];
    onLoad?: (dataSource: T['data']) => void;
    onRequestError?: (e: Error) => void;
  },
): UseFetchDataAction<T> => {
  const {
    defaultPageSize = 20,
    defaultCurrent = 1,
    onLoad = () => null,
    onRequestError = () => null,
  } = options || {};

  const [list, setList] = useState<T['data']>(defaultData as any);
  const [loading, setLoading] = useState<boolean | undefined>(undefined);

  const [pageInfo, setPageInfo] = useState<PageInfo>({
    hasMore: false,
    page: defaultCurrent || 1,
    total: 0,
    pageSize: defaultPageSize,
  });

  // pre state
  const prePage = usePrevious(pageInfo.page);
  const prePageSize = usePrevious(pageInfo.pageSize);

  const { effects = [] } = options || {};

  /**
   * Request data
   * @param isAppend Whether to add data to the end
   */
  const fetchList = async (isAppend?: boolean) => {
    if (loading) {
      return;
    }
    setLoading(true);
    const { pageSize, page } = pageInfo;

    try {
      const { data, success, total: dataTotal = 0 } =
        (await getData({
          current: page,
          pageSize,
        })) || {};
      if (success !== false) {
        if (isAppend && list) {
          setList([...list, ...data]);
        } else {
          setList(data);
        }
        // Determine if you can continue to turn pages
        setPageInfo({ ...pageInfo, total: dataTotal, hasMore: dataTotal > pageSize * page });
      }
      if (onLoad) {
        onLoad(data);
      }
    } catch (e) {
      onRequestError(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchListDebounce = useDebounceFn(fetchList, [], 200);

  const fetchMore = () => {
    // Ignore if there are no more
    if (pageInfo.hasMore) {
      setPageInfo({ ...pageInfo, page: pageInfo.page + 1 });
    }
  };

  /**
   * Refresh automatically when pageIndex changes
   */
  useEffect(() => {
    const { page, pageSize } = pageInfo;
    // If the last page number is empty or deplicated, it is not necessary to search
    // If pageSize changes, search is required, so prePageSize is added again
    if ((!prePage || prePage === page) && (!prePageSize || prePageSize === pageSize)) {
      return () => undefined;
    }
    // if list is longer than pageSize
    // description is a fake pagination
    // (pageIndex-1||1) at least the first page
    // greater than 10 on the first page
    // The second page should also be greater than 10
    if (page !== undefined && list.length <= pageSize) {
      fetchListDebounce.run();
      return () => fetchListDebounce.cancel();
    }
    return () => undefined;
  }, [pageInfo.page]);

  // pageSize returns to the first page after modification
  useEffect(() => {
    if (!prePageSize) {
      return () => undefined;
    }
    setList([]);
    setPageInfo({ ...pageInfo, page: 1 });
    fetchListDebounce.run();
    return () => fetchListDebounce.cancel();
  }, [pageInfo.pageSize]);

  /**
   * Reset pageIndex to 1
   */
  const resetPageIndex = () => {
    setPageInfo({ ...pageInfo, page: 1 });
  };

  useEffect(() => {
    fetchListDebounce.run();
    return () => fetchListDebounce.cancel();
  }, effects);

  return {
    dataSource: list,
    loading,
    reload: async () => fetchListDebounce.run(),
    fetchMore,
    total: pageInfo.total,
    hasMore: pageInfo.hasMore,
    resetPageIndex,
    current: pageInfo.page,
    reset: () => {
      setPageInfo({
        hasMore: false,
        page: defaultCurrent || 1,
        total: 0,
        pageSize: defaultPageSize,
      });
    },
    pageSize: pageInfo.pageSize,
    setPageInfo: (info) =>
      setPageInfo({
        ...pageInfo,
        ...info,
      }),
  };
};

export default useFetchData;
