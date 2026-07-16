import { renderHook, act } from '@testing-library/react';
import { useDataTable } from '../use-data-table';
import { ColumnDef } from '@tanstack/react-table';

// Mock nuqs
jest.mock('nuqs', () => ({
  useQueryState: jest.fn((key, defaultVal) => {
    return [defaultVal?.defaultValue ?? null, jest.fn()];
  }),
  useQueryStates: jest.fn(() => [{}, jest.fn()]),
  parseAsInteger: { withOptions: jest.fn().mockReturnThis(), withDefault: jest.fn((d) => ({ defaultValue: d })) },
  parseAsString: { withOptions: jest.fn().mockReturnThis() },
  parseAsArrayOf: jest.fn(() => ({ withOptions: jest.fn().mockReturnThis() })),
}));

// Mock hooks used inside
jest.mock('@/hooks/use-debounced-callback', () => ({
  useDebouncedCallback: (cb: any) => cb,
}));

jest.mock('@/lib/parsers', () => ({
  getSortingStateParser: jest.fn(() => ({
    withOptions: jest.fn().mockReturnThis(),
    withDefault: jest.fn((d) => ({ defaultValue: d })),
  })),
}));

describe('useDataTable', () => {
  const columns: ColumnDef<any, any>[] = [
    { id: 'name', header: 'Name', enableColumnFilter: true },
    { id: 'age', header: 'Age' },
  ];

  it('initializes table instance correctly', () => {
    const { result } = renderHook(() =>
      useDataTable({
        columns,
        data: [],
        pageCount: 1,
      })
    );

    expect(result.current.table).toBeDefined();
    // Default debounced/throttle times should be accessible
    expect(result.current.debounceMs).toBe(300);
    expect(result.current.throttleMs).toBe(50);
  });

  it('handles custom configuration', () => {
    const { result } = renderHook(() =>
      useDataTable({
        columns,
        data: [],
        pageCount: 10,
        debounceMs: 500,
        enableAdvancedFilter: true,
      })
    );

    expect(result.current.debounceMs).toBe(500);
    expect(result.current.table.getPageCount()).toBe(10);
  });
});
