
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';

interface MultiSourceReportTableProps {
  data: any[];
  columns: string[];
}

export function MultiSourceReportTable({ data, columns }: MultiSourceReportTableProps) {
  const { t } = useTranslation();
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-detect ALL columns from ALL rows in the dataset
  const actualColumns = React.useMemo(() => {
    if (data.length === 0) {
      console.log('No data available, using provided columns:', columns);
      return columns;
    }
    
    // Scan ALL rows to collect ALL unique column names
    const allColumnNames = new Set<string>();
    
    data.forEach(row => {
      Object.keys(row).forEach(key => {
        // Exclude internal fields that start with underscore
        if (!key.startsWith('_')) {
          allColumnNames.add(key);
        }
      });
    });
    
    const dataKeys = Array.from(allColumnNames);
    console.log('All data keys found across all rows:', dataKeys);
    console.log('Provided columns:', columns);
    console.log('Total rows scanned:', data.length);
    
    // If we have data keys, use them instead of provided columns
    if (dataKeys.length > 0) {
      return dataKeys.sort(); // Sort for consistent display order
    }
    
    return columns;
  }, [data, columns]);

  console.log('Using columns for display:', actualColumns);
  console.log('Sample data rows:', data.slice(0, 3));

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const formatCellValue = (value: any, column: string): string => {
    if (value === null || value === undefined) return '-';
    
    if (column.includes('date') || column.includes('_at')) {
      return new Date(value).toLocaleDateString();
    }
    
    if (column.includes('percentage') || column.includes('rate')) {
      return `${Number(value).toFixed(1)}%`;
    }
    
    if (column.includes('hours')) {
      return `${Number(value).toFixed(1)}h`;
    }
    
    return String(value);
  };

  const getColumnDisplayName = (column: string): string => {
    // Handle prefixed columns from multi-source reports
    if (column.includes('_')) {
      const parts = column.split('_');
      if (parts.length > 1) {
        // Remove source prefix and format the rest
        const displayName = parts.slice(1).join(' ');
        return displayName.replace(/\b\w/g, l => l.toUpperCase());
      }
    }
    
    return column
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSourceFromColumn = (column: string): string | null => {
    if (column.includes('_')) {
      const parts = column.split('_');
      if (parts.length > 1) {
        return parts[0];
      }
    }
    return null;
  };

  const getSourceBadgeColor = (source: string): string => {
    const colorMap: Record<string, string> = {
      'workflow': 'bg-blue-100 text-blue-800',
      'user': 'bg-green-100 text-green-800',
      'step': 'bg-purple-100 text-purple-800',
      'performance': 'bg-orange-100 text-orange-800',
      'profiles': 'bg-green-100 text-green-800',
      'workflows': 'bg-blue-100 text-blue-800',
      'notifications': 'bg-yellow-100 text-yellow-800'
    };
    return colorMap[source] || 'bg-gray-100 text-gray-800';
  };

  const groupedData = React.useMemo(() => {
    // Group data by source if it's a multi-section report
    const hasSourceLabels = data.length > 0 && data[0]._source;
    
    if (hasSourceLabels) {
      const grouped = data.reduce((acc, row) => {
        const source = row._source || 'unknown';
        if (!acc[source]) {
          acc[source] = [];
        }
        acc[source].push(row);
        return acc;
      }, {} as Record<string, any[]>);
      
      return grouped;
    }
    
    return { all: data };
  }, [data]);

  const filteredAndSortedData = React.useMemo(() => {
    const processGroup = (groupData: any[]) => {
      let filtered = groupData;

      // Apply search filter using actual columns
      if (searchTerm) {
        filtered = groupData.filter(row =>
          actualColumns.some(column =>
            String(row[column] || '')
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
        );
      }

      // Apply sorting
      if (sortColumn) {
        filtered = [...filtered].sort((a, b) => {
          const aVal = a[sortColumn];
          const bVal = b[sortColumn];
          
          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;
          
          let comparison = 0;
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            comparison = aVal - bVal;
          } else {
            comparison = String(aVal).localeCompare(String(bVal));
          }
          
          return sortDirection === 'desc' ? -comparison : comparison;
        });
      }

      return filtered;
    };

    const result: Record<string, any[]> = {};
    Object.keys(groupedData).forEach(source => {
      result[source] = processGroup(groupedData[source]);
    });
    
    return result;
  }, [groupedData, actualColumns, searchTerm, sortColumn, sortDirection]);

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{t('reports.noData')}</p>
      </div>
    );
  }

  const totalRows = Object.values(filteredAndSortedData).reduce((sum, group) => sum + group.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('reports.searchData')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-gray-500">
          {t('reports.showingResults', { 
            count: totalRows, 
            total: data.length 
          })}
        </div>
      </div>

      {Object.keys(filteredAndSortedData).map(source => (
        <div key={source} className="space-y-2">
          {source !== 'all' && (
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium">
                {data.find(row => row._source === source)?._sourceLabel || source}
              </h3>
              <Badge variant="outline" className={getSourceBadgeColor(source)}>
                {filteredAndSortedData[source].length} rows
              </Badge>
            </div>
          )}
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {actualColumns.map((column) => {
                    const sourceFromColumn = getSourceFromColumn(column);
                    return (
                      <TableHead key={column} className="font-medium">
                        <Button
                          variant="ghost"
                          className="h-auto p-0 font-medium"
                          onClick={() => handleSort(column)}
                        >
                          <div className="flex flex-col items-start">
                            <span className="mr-2">{getColumnDisplayName(column)}</span>
                            {sourceFromColumn && source === 'all' && (
                              <Badge variant="outline" className={`text-xs ${getSourceBadgeColor(sourceFromColumn)}`}>
                                {sourceFromColumn}
                              </Badge>
                            )}
                          </div>
                          {getSortIcon(column)}
                        </Button>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData[source].map((row, index) => (
                  <TableRow key={`${source}-${index}`}>
                    {actualColumns.map((column) => (
                      <TableCell key={column}>
                        {formatCellValue(row[column], column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}
