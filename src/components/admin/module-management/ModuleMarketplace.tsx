
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Search, 
  Download, 
  Star, 
  CheckCircle,
  Clock,
  Users,
  Zap,
  Shield
} from 'lucide-react';

interface MarketplaceModule {
  id: string;
  name: string;
  displayName: string;
  description: string;
  longDescription: string;
  version: string;
  author: string;
  category: string;
  rating: number;
  downloads: number;
  price: 'free' | 'premium';
  isInstalled: boolean;
  isCompatible: boolean;
  dependencies: string[];
  features: string[];
  screenshots: string[];
}

export function ModuleMarketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock marketplace data
  const marketplaceModules: MarketplaceModule[] = [
    {
      id: 'neura-analytics',
      name: 'neura-analytics',
      displayName: 'NeuraAnalytics',
      description: 'Advanced analytics and reporting for your workspace',
      longDescription: 'Comprehensive analytics platform with real-time dashboards, custom reports, and data visualization tools.',
      version: '1.2.0',
      author: 'NeuraCore Team',
      category: 'analytics',
      rating: 4.8,
      downloads: 1250,
      price: 'premium',
      isInstalled: false,
      isCompatible: true,
      dependencies: ['neura-core'],
      features: ['Real-time Dashboards', 'Custom Reports', 'Data Export', 'API Integration'],
      screenshots: []
    },
    {
      id: 'neura-calendar',
      name: 'neura-calendar',
      displayName: 'NeuraCalendar',
      description: 'Integrated calendar and scheduling system',
      longDescription: 'Full-featured calendar with event management, team scheduling, and integration with popular calendar services.',
      version: '1.1.5',
      author: 'NeuraCore Team',
      category: 'productivity',
      rating: 4.6,
      downloads: 980,
      price: 'free',
      isInstalled: false,
      isCompatible: true,
      dependencies: ['neura-core'],
      features: ['Event Management', 'Team Scheduling', 'Calendar Sync', 'Reminders'],
      screenshots: []
    },
    {
      id: 'neura-chat',
      name: 'neura-chat',
      displayName: 'NeuraChat',
      description: 'Real-time messaging and collaboration',
      longDescription: 'Built-in chat system with channels, direct messages, file sharing, and integration with workflows.',
      version: '2.0.1',
      author: 'NeuraCore Team',
      category: 'communication',
      rating: 4.9,
      downloads: 2100,
      price: 'free',
      isInstalled: false,
      isCompatible: true,
      dependencies: ['neura-core'],
      features: ['Real-time Chat', 'File Sharing', 'Channel Management', 'Workflow Integration'],
      screenshots: []
    },
    {
      id: 'neura-ai',
      name: 'neura-ai',
      displayName: 'NeuraAI',
      description: 'AI-powered automation and insights',
      longDescription: 'Advanced AI capabilities including natural language processing, predictive analytics, and intelligent automation.',
      version: '1.0.0-beta',
      author: 'NeuraCore Team',
      category: 'ai',
      rating: 4.3,
      downloads: 450,
      price: 'premium',
      isInstalled: false,
      isCompatible: false,
      dependencies: ['neura-core', 'neura-flow'],
      features: ['NLP Processing', 'Predictive Analytics', 'Auto-suggestions', 'Smart Workflows'],
      screenshots: []
    }
  ];

  const categories = [
    { id: 'all', label: 'All Categories', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: Zap },
    { id: 'productivity', label: 'Productivity', icon: Clock },
    { id: 'communication', label: 'Communication', icon: Users },
    { id: 'ai', label: 'AI & Automation', icon: Shield }
  ];

  const filteredModules = marketplaceModules.filter(module => {
    const matchesSearch = module.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredModules = marketplaceModules.filter(m => m.rating >= 4.5);
  const newModules = marketplaceModules.filter(m => m.version.includes('beta') || parseFloat(m.version) >= 1.0);

  const handleInstallModule = (moduleId: string) => {
    console.log('Installing module:', moduleId);
    // Implementation for module installation
  };

  const renderModuleCard = (module: MarketplaceModule) => (
    <Card key={module.id} className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{module.displayName}</CardTitle>
              <p className="text-sm text-muted-foreground">by {module.author}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={module.price === 'free' ? 'secondary' : 'default'}>
              {module.price === 'free' ? 'Free' : 'Premium'}
            </Badge>
            {module.isInstalled && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Installed
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{module.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span>{module.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4 text-muted-foreground" />
              <span>{module.downloads.toLocaleString()}</span>
            </div>
          </div>
          <Badge variant="outline">v{module.version}</Badge>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Key Features:</p>
          <div className="flex flex-wrap gap-1">
            {module.features.slice(0, 3).map(feature => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {module.features.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{module.features.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            {module.isCompatible ? (
              <span className="text-green-600">✓ Compatible</span>
            ) : (
              <span className="text-red-600">⚠ Requires updates</span>
            )}
          </div>
          <Button 
            size="sm" 
            disabled={module.isInstalled || !module.isCompatible}
            onClick={() => handleInstallModule(module.id)}
          >
            {module.isInstalled ? 'Installed' : 'Install'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                <Icon className="h-4 w-4 mr-1" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Module Categories */}
      <Tabs value="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse All</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="new">New & Updated</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {filteredModules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No modules found</h3>
                <p className="text-muted-foreground text-center">
                  Try adjusting your search criteria or browse different categories.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.map(renderModuleCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="featured" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredModules.map(renderModuleCard)}
          </div>
        </TabsContent>

        <TabsContent value="new" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newModules.map(renderModuleCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
