
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useUsers } from '@/hooks/useUsers';
import { useSavedWorkflows } from '@/hooks/useSavedWorkflows';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import type { ReportFilters } from './ReportsContent';

interface ReportFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
}

export default function ReportFilters({ filters, onFiltersChange }: ReportFiltersProps) {
  const { t } = useTranslation();
  const { canViewUsers } = useWorkflowPermissions();
  const { data: users } = useUsers();
  const { workflows } = useSavedWorkflows();
  const [showFilters, setShowFilters] = useState(false);

  const updateFilters = (updates: Partial<ReportFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: {
        from: new Date(new Date().setDate(new Date().getDate() - 30)),
        to: new Date(),
      },
    });
  };

  const departments = Array.from(
    new Set(users?.map(user => user.department).filter((dept): dept is string => Boolean(dept)))
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t('reports.filters')}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? t('common.close') : t('reports.showFilters')}
            </Button>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              {t('reports.clearFilters')}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {showFilters && (
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('reports.dateRange')}</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? (
                        format(filters.dateRange.from, "PPP")
                      ) : (
                        t('reports.pickDate')
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from}
                      onSelect={(date) =>
                        date && updateFilters({
                          dateRange: { ...filters.dateRange, from: date }
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.to ? (
                        format(filters.dateRange.to, "PPP")
                      ) : (
                        t('reports.pickDate')
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to}
                      onSelect={(date) =>
                        date && updateFilters({
                          dateRange: { ...filters.dateRange, to: date }
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Department Filter */}
            {canViewUsers && departments.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('reports.department')}</label>
                <Select
                  value={filters.department || ""}
                  onValueChange={(value) =>
                    updateFilters({ department: value || undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('reports.selectDepartment')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('reports.allDepartments')}</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* User Filter */}
            {canViewUsers && users && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('reports.user')}</label>
                <Select
                  value={filters.userId || ""}
                  onValueChange={(value) =>
                    updateFilters({ userId: value || undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('reports.selectUser')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('reports.allUsers')}</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Workflow Filter */}
            {workflows && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('reports.workflow')}</label>
                <Select
                  value={filters.workflowId || ""}
                  onValueChange={(value) =>
                    updateFilters({ workflowId: value || undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('reports.selectWorkflow')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('reports.allWorkflows')}</SelectItem>
                    {workflows.map((workflow) => (
                      <SelectItem key={workflow.id} value={workflow.id}>
                        {workflow.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
