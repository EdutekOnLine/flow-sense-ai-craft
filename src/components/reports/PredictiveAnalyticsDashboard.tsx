
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, Clock, Target, Brain } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { usePredictiveAnalytics, useAnomalyDetection, useResourceOptimization } from '@/hooks/useAdvancedAnalytics';

export default function PredictiveAnalyticsDashboard() {
  const { data: predictiveData, isLoading: isPredictiveLoading } = usePredictiveAnalytics();
  const { data: anomalyData, isLoading: isAnomalyLoading } = useAnomalyDetection();
  const { data: resourceData, isLoading: isResourceLoading } = useResourceOptimization();

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Mock forecast data for visualization
  const forecastData = [
    { period: 'Week 1', actual: 85, predicted: 87, confidence_min: 82, confidence_max: 92 },
    { period: 'Week 2', actual: 88, predicted: 90, confidence_min: 85, confidence_max: 95 },
    { period: 'Week 3', actual: null, predicted: 92, confidence_min: 87, confidence_max: 97 },
    { period: 'Week 4', actual: null, predicted: 89, confidence_min: 84, confidence_max: 94 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Predictive Analytics Dashboard</h2>
        <p className="text-gray-600 mt-1">
          ML-powered insights, forecasts, and intelligent recommendations
        </p>
      </div>

      {/* Predictive Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Forecast
              </CardTitle>
              <CardDescription>
                ML-generated predictions for upcoming performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPredictiveLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Brain className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {predictiveData && (
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                      {getTrendIcon(predictiveData.trend_direction)}
                      <div>
                        <p className="font-medium">
                          Trend: <span className="capitalize">{predictiveData.trend_direction}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Predicted completion rate: {predictiveData.predicted_completion_rate?.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {predictiveData.recommendation}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={forecastData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis domain={[70, 100]} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="confidence_max"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.1}
                      />
                      <Area
                        type="monotone"
                        dataKey="confidence_min"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#ffffff"
                        fillOpacity={1}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Anomaly Detection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Anomaly Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAnomalyLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Brain className="h-6 w-6 animate-spin text-orange-500" />
                </div>
              ) : anomalyData ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Anomaly Score</span>
                    <Badge className={getSeverityColor(anomalyData.severity)}>
                      {anomalyData.severity}
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={anomalyData.anomaly_score * 100} 
                    className="h-2"
                  />
                  
                  <div className="text-xs text-gray-500">
                    <p className="font-medium mb-1">Affected Metrics:</p>
                    {anomalyData.affected_metrics.map((metric, i) => (
                      <span key={i} className="inline-block bg-gray-100 px-2 py-1 rounded mr-1 mb-1">
                        {metric}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <p className="font-medium mb-1">Recommendations:</p>
                    {anomalyData.recommendations.slice(0, 2).map((rec, i) => (
                      <p key={i} className="mb-1">• {rec}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No anomalies detected</p>
              )}
            </CardContent>
          </Card>

          {/* Resource Optimization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Resource Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isResourceLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Brain className="h-6 w-6 animate-spin text-green-500" />
                </div>
              ) : resourceData ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Optimization Score</span>
                    <Badge variant="outline">
                      {Math.round(resourceData.optimization_score * 100)}%
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={resourceData.optimization_score * 100} 
                    className="h-2"
                  />
                  
                  {resourceData.overloaded_users && resourceData.overloaded_users.length > 0 && (
                    <div className="text-xs text-gray-500">
                      <p className="font-medium text-red-600">
                        {resourceData.overloaded_users.length} overloaded team members
                      </p>
                    </div>
                  )}
                  
                  {resourceData.underutilized_users && resourceData.underutilized_users.length > 0 && (
                    <div className="text-xs text-gray-500">
                      <p className="font-medium text-green-600">
                        {resourceData.underutilized_users.length} underutilized team members
                      </p>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    <p className="font-medium mb-1">Recommendations:</p>
                    {resourceData.recommendations.slice(0, 2).map((rec, i) => (
                      <p key={i} className="mb-1">• {rec}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Resource data unavailable</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Real-time Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Real-time ML Insights
          </CardTitle>
          <CardDescription>
            Live analysis and pattern recognition from your workflow data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Capacity Prediction</h3>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Current capacity can handle 15% increase in workflow volume
              </p>
              <Progress value={85} className="h-1" />
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Efficiency Pattern</h3>
                <Target className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Peak productivity detected: Tuesday 10AM - Thursday 2PM
              </p>
              <Progress value={92} className="h-1" />
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Risk Assessment</h3>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-xs text-gray-600 mb-2">
                Low risk of deadline misses based on current velocity
              </p>
              <Progress value={25} className="h-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
