export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

export interface DataTableFilterableColumn<TData, TValue> {
  id: string;
  title: string;
  options: Option[];
}
