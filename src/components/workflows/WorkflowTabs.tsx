
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkflowList from './WorkflowList';
import WorkflowCreation from './WorkflowCreation';
import { Plus, List } from 'lucide-react';

export default function WorkflowTabs() {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            View Workflows
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Workflow
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <WorkflowList />
        </TabsContent>
        
        <TabsContent value="create">
          <WorkflowCreation />
        </TabsContent>
      </Tabs>
    </div>
  );
}
