
export interface ReportConfig {
  dataSources: DataSourceWithJoins[];
  selectedColumns: SelectedColumn[];
  filters: FilterCriteria[];
  name: string;
}

export interface DataSourceWithJoins {
  id: string;
  sourceId: string;
  alias?: string;
  joins?: JoinConfig[];
}

export interface JoinConfig {
  targetSourceId: string;
  joinType: 'inner' | 'left' | 'right';
  onConditions: JoinCondition[];
}

export interface JoinCondition {
  leftColumn: string;
  rightColumn: string;
}

export interface SelectedColumn {
  sourceId: string;
  column: string;
  alias?: string;
}

export interface FilterCriteria {
  id: string;
  sourceId: string;
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
  relationships?: RelationshipConfig[];
}

export interface ColumnConfig {
  id: string;
  name: string;
  dataType: 'text' | 'number' | 'date' | 'boolean';
  filterable: boolean;
  sortable: boolean;
}

export interface RelationshipConfig {
  targetTable: string;
  localColumn: string;
  foreignColumn: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-one';
}
