
export interface ReportConfig {
  dataSource: string;
  selectedColumns: string[];
  filters: FilterCriteria[];
  name: string;
}

export interface FilterCriteria {
  id: string;
  column: string;
  operator: FilterOperator;
  value: string | number | boolean;
  dataType: 'text' | 'number' | 'date' | 'boolean';
}

export type FilterOperator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_equal'
  | 'less_equal'
  | 'between'
  | 'is_null'
  | 'is_not_null'
  | 'in'
  | 'not_in';

export interface DataSourceConfig {
  id: string;
  name: string;
  table: string;
  columns: ColumnConfig[];
  joins?: JoinConfig[];
}

export interface ColumnConfig {
  id: string;
  name: string;
  dataType: 'text' | 'number' | 'date' | 'boolean';
  filterable: boolean;
  sortable: boolean;
}

export interface JoinConfig {
  table: string;
  on: string;
  type: 'inner' | 'left' | 'right';
}
