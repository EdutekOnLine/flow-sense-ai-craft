
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataSourceWithJoins, JoinConfig } from './types';
import { Plus, X, Link } from 'lucide-react';

interface MultiDataSourceSelectorProps {
  dataSources: DataSourceWithJoins[];
  onChange: (dataSources: DataSourceWithJoins[]) => void;
}

const availableDataSources = [
  { id: 'workflow_performance', name: 'Workflow Performance', table: 'workflow_performance_analytics' },
  { id: 'user_performance', name: 'User Performance', table: 'user_performance_analytics' },
  { id: 'workflows', name: 'Workflows', table: 'workflows' },
  { id: 'profiles', name: 'Users', table: 'profiles' },
  { id: 'workflow_steps', name: 'Workflow Steps', table: 'workflow_steps' },
  { id: 'workflow_step_assignments', name: 'Task Assignments', table: 'workflow_step_assignments' },
  { id: 'department_analytics', name: 'Department Analytics', table: 'department_analytics' },
  { id: 'workflow_trends', name: 'Workflow Trends', table: 'workflow_trends' },
  { id: 'notifications', name: 'Notifications', table: 'notifications' }
];

const commonJoinRelationships = {
  workflows: {
    profiles: [
      { left: 'created_by', right: 'id', label: 'Creator' },
      { left: 'assigned_to', right: 'id', label: 'Assignee' }
    ],
    workflow_steps: [
      { left: 'id', right: 'workflow_id', label: 'Steps' }
    ]
  },
  workflow_steps: {
    profiles: [
      { left: 'assigned_to', right: 'id', label: 'Assignee' }
    ],
    workflow_step_assignments: [
      { left: 'id', right: 'workflow_step_id', label: 'Assignments' }
    ]
  },
  workflow_step_assignments: {
    profiles: [
      { left: 'assigned_to', right: 'id', label: 'Assignee' },
      { left: 'assigned_by', right: 'id', label: 'Assigner' }
    ]
  },
  notifications: {
    profiles: [
      { left: 'user_id', right: 'id', label: 'User' }
    ],
    workflow_steps: [
      { left: 'workflow_step_id', right: 'id', label: 'Step' }
    ]
  }
};

export function MultiDataSourceSelector({ dataSources, onChange }: MultiDataSourceSelectorProps) {
  const { t } = useTranslation();
  const [selectedSource, setSelectedSource] = useState('');

  const addDataSource = () => {
    if (!selectedSource || dataSources.some(ds => ds.sourceId === selectedSource)) return;

    const newDataSource: DataSourceWithJoins = {
      id: crypto.randomUUID(),
      sourceId: selectedSource,
      joins: []
    };

    onChange([...dataSources, newDataSource]);
    setSelectedSource('');
  };

  const removeDataSource = (id: string) => {
    onChange(dataSources.filter(ds => ds.id !== id));
  };

  const addJoin = (sourceId: string, targetSourceId: string, leftCol: string, rightCol: string) => {
    onChange(dataSources.map(ds => {
      if (ds.id === sourceId) {
        const newJoin: JoinConfig = {
          targetSourceId,
          joinType: 'left',
          onConditions: [{ leftColumn: leftCol, rightColumn: rightCol }]
        };
        return { ...ds, joins: [...(ds.joins || []), newJoin] };
      }
      return ds;
    }));
  };

  const removeJoin = (sourceId: string, joinIndex: number) => {
    onChange(dataSources.map(ds => {
      if (ds.id === sourceId) {
        const newJoins = [...(ds.joins || [])];
        newJoins.splice(joinIndex, 1);
        return { ...ds, joins: newJoins };
      }
      return ds;
    }));
  };

  const getAvailableJoins = (sourceId: string) => {
    const relationships = commonJoinRelationships[sourceId] || {};
    const usedTargets = dataSources.find(ds => ds.sourceId === sourceId)?.joins?.map(j => j.targetSourceId) || [];
    const availableTargets = dataSources.filter(ds => ds.sourceId !== sourceId && !usedTargets.includes(ds.sourceId));
    
    return availableTargets.map(target => {
      const targetRelationships = relationships[target.sourceId] || [];
      return { target, relationships: targetRelationships };
    }).filter(item => item.relationships.length > 0);
  };

  const getSourceName = (sourceId: string) => {
    return availableDataSources.find(ds => ds.id === sourceId)?.name || sourceId;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Select value={selectedSource} onValueChange={setSelectedSource}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={t('reports.selectDataSource')} />
          </SelectTrigger>
          <SelectContent>
            {availableDataSources
              .filter(source => !dataSources.some(ds => ds.sourceId === source.id))
              .map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  {source.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Button onClick={addDataSource} disabled={!selectedSource}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {dataSources.map((dataSource, index) => (
          <Card key={dataSource.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {index === 0 ? 'Primary: ' : 'Joined: '}{getSourceName(dataSource.sourceId)}
                </CardTitle>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDataSource(dataSource.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {index > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Joins:</div>
                  {dataSource.joins?.map((join, joinIndex) => (
                    <div key={joinIndex} className="flex items-center space-x-2 text-xs">
                      <Badge variant="outline">
                        {join.joinType.toUpperCase()} JOIN {getSourceName(join.targetSourceId)}
                      </Badge>
                      <span className="text-muted-foreground">
                        ON {join.onConditions[0]?.leftColumn} = {join.onConditions[0]?.rightColumn}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeJoin(dataSource.id, joinIndex)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {getAvailableJoins(dataSource.sourceId).map(({ target, relationships }) => (
                    <div key={target.sourceId} className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        Available joins to {getSourceName(target.sourceId)}:
                      </div>
                      {relationships.map((rel, relIndex) => (
                        <Button
                          key={relIndex}
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => addJoin(dataSource.id, target.sourceId, rel.left, rel.right)}
                        >
                          <Link className="h-3 w-3 mr-1" />
                          {rel.label} ({rel.left} → {rel.right})
                        </Button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {dataSources.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>{t('reports.selectDataSourceFirst')}</p>
        </div>
      )}
    </div>
  );
}
