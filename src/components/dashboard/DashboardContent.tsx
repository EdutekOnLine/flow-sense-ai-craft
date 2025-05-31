
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Welcome to your dashboard. You can start building new features here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
