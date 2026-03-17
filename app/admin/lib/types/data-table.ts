import type { ColumnSort } from '@tanstack/react-table';

export type FilterOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'iLike' | 'notILike' | 'ne' | 'isEmpty' | 'isNotEmpty' | 'isBetween' | 'isNotBetween' | 'isRelativeToToday' | 'inArray' | 'notInArray';

export type FilterVariant = 'text' | 'number' | 'select' | 'date' | 'range' | 'boolean' | 'dateRange' | 'multiSelect';

export type ExtendedColumnSort<TData = any> = ColumnSort;

export interface ExtendedColumnFilter {
  id: string;
  value: any;
  operator: FilterOperator;
  variant: FilterVariant;
  label?: string;
}
