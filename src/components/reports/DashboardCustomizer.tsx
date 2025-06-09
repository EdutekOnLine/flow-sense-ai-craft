
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Layout, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Plus, 
  Settings, 
  Grid3X3, 
  Maximize2,
  Move3D,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'text';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config: any;
  visible: boolean;
}

interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
}

export default function DashboardCustomizer() {
  const [layouts, setLayouts] = useState<DashboardLayout[]>([
    {
      id: '1',
      name: 'Executive Overview',
      description: 'High-level metrics and trends for executives',
      isDefault: true,
      widgets: [
        {
          id: 'w1',
          type: 'metric',
          title: 'Total Workflows',
          size: 'small',
          position: { x: 0, y: 0 },
          config: { value: 1234, trend: '+12%' },
          visible: true
        },
        {
          id: 'w2',
          type: 'chart',
          title: 'Performance Trends',
          size: 'large',
          position: { x: 1, y: 0 },
          config: { chartType: 'line' },
          visible: true
        }
      ]
    },
    {
      id: '2',
      name: 'Operational Dashboard',
      description: 'Detailed operational metrics and analytics',
      isDefault: false,
      widgets: [
        {
          id: 'w3',
          type: 'table',
          title: 'Active Workflows',
          size: 'medium',
          position: { x: 0, y: 0 },
          config: { columns: ['name', 'status', 'assignee'] },
          visible: true
        }
      ]
    }
  ]);

  const [selectedLayout, setSelectedLayout] = useState<string>('1');
  const [editMode, setEditMode] = useState(false);
  const [newWidgetType, setNewWidgetType] = useState<string>('');

  const widgetTypes = [
    { value: 'metric', label: 'Key Metric', icon: <BarChart3 className="h-4 w-4" /> },
    { value: 'chart', label: 'Chart', icon: <TrendingUp className="h-4 w-4" /> },
    { value: 'table', label: 'Data Table', icon: <Grid3X3 className="h-4 w-4" /> },
    { value: 'text', label: 'Text Widget', icon: <Layout className="h-4 w-4" /> }
  ];

  const getCurrentLayout = () => layouts.find(l => l.id === selectedLayout);

  const handleAddWidget = () => {
    if (!newWidgetType) return;

    const newWidget: DashboardWidget = {
      id: `w${Date.now()}`,
      type: newWidgetType as any,
      title: `New ${newWidgetType} Widget`,
      size: 'medium',
      position: { x: 0, y: 0 },
      config: {},
      visible: true
    };

    setLayouts(prev => prev.map(layout => 
      layout.id === selectedLayout 
        ? { ...layout, widgets: [...layout.widgets, newWidget] }
        : layout
    ));

    setNewWidgetType('');
    toast.success('Widget added successfully');
  };

  const handleRemoveWidget = (widgetId: string) => {
    setLayouts(prev => prev.map(layout => 
      layout.id === selectedLayout 
        ? { ...layout, widgets: layout.widgets.filter(w => w.id !== widgetId) }
        : layout
    ));
    toast.success('Widget removed');
  };

  const handleToggleWidget = (widgetId: string) => {
    setLayouts(prev => prev.map(layout => 
      layout.id === selectedLayout 
        ? { 
            ...layout, 
            widgets: layout.widgets.map(w => 
              w.id === widgetId ? { ...w, visible: !w.visible } : w
            )
          }
        : layout
    ));
  };

  const handleCreateLayout = () => {
    const newLayout: DashboardLayout = {
      id: Date.now().toString(),
      name: 'New Dashboard',
      description: 'Custom dashboard layout',
      isDefault: false,
      widgets: []
    };

    setLayouts(prev => [...prev, newLayout]);
    setSelectedLayout(newLayout.id);
    toast.success('New dashboard layout created');
  };

  const currentLayout = getCurrentLayout();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Customizer</h2>
          <p className="text-gray-600 mt-1">Customize your dashboard layout and widgets</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCreateLayout}>
            <Plus className="h-4 w-4 mr-1" />
            New Layout
          </Button>
          <Button 
            variant={editMode ? "secondary" : "outline"} 
            onClick={() => setEditMode(!editMode)}
          >
            <Settings className="h-4 w-4 mr-1" />
            {editMode ? 'Exit Edit' : 'Edit Mode'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Layout Selection & Widget Library */}
        <div className="space-y-6">
          {/* Layout Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Dashboard Layouts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {layouts.map((layout) => (
                <div
                  key={layout.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedLayout === layout.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedLayout(layout.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{layout.name}</h4>
                    {layout.isDefault && <Badge variant="secondary">Default</Badge>}
                  </div>
                  <p className="text-sm text-gray-600">{layout.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {layout.widgets.length} widgets
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Widget Library */}
          {editMode && (
            <Card>
              <CardHeader>
                <CardTitle>Add Widget</CardTitle>
                <CardDescription>Choose a widget type to add to your dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={newWidgetType} onValueChange={setNewWidgetType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select widget type" />
                  </SelectTrigger>
                  <SelectContent>
                    {widgetTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddWidget} className="w-full" disabled={!newWidgetType}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Widget
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Dashboard Preview */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentLayout?.name}</CardTitle>
                  <CardDescription>{currentLayout?.description}</CardDescription>
                </div>
                {editMode && (
                  <Badge variant="outline">Edit Mode</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Widget Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentLayout?.widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className={`relative border rounded-lg p-4 ${
                      widget.visible ? 'bg-white' : 'bg-gray-50 opacity-50'
                    } ${
                      widget.size === 'large' ? 'md:col-span-2' : 
                      widget.size === 'small' ? 'md:col-span-1' : 'md:col-span-1'
                    }`}
                  >
                    {editMode && (
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleWidget(widget.id)}
                        >
                          <Switch checked={widget.visible} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveWidget(widget.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mb-3">
                      {widget.type === 'metric' && <BarChart3 className="h-4 w-4" />}
                      {widget.type === 'chart' && <TrendingUp className="h-4 w-4" />}
                      {widget.type === 'table' && <Grid3X3 className="h-4 w-4" />}
                      {widget.type === 'text' && <Layout className="h-4 w-4" />}
                      <h4 className="font-medium">{widget.title}</h4>
                    </div>
                    
                    {/* Widget Content Preview */}
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-sm">
                        {widget.type === 'metric' && 'Key metric display'}
                        {widget.type === 'chart' && 'Chart visualization'}
                        {widget.type === 'table' && 'Data table'}
                        {widget.type === 'text' && 'Text content'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {(!currentLayout?.widgets.length || currentLayout.widgets.length === 0) && (
                <div className="text-center py-12 text-gray-500">
                  <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No widgets in this layout</p>
                  {editMode && (
                    <p className="text-sm mt-2">Add widgets from the library on the left</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
