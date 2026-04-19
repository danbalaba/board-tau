'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/app/admin/components/ui/table';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { Eye, Edit } from 'lucide-react';

import { usePropertyPerformance } from '@/app/admin/hooks/use-property-performance';

const demandColors = {
  low: 'destructive',
  medium: 'secondary',
  high: 'default'
};

const demandLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

export function PricingOptimization() {
  const { data: apiResponse, isLoading, error } = usePropertyPerformance('30d');
  const data = apiResponse?.data;
  const propertiesPricing = data?.pricingRecommendations || [];

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading pricing data...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;

  const avgPrice = propertiesPricing.length > 0 
    ? propertiesPricing.reduce((sum, p) => sum + p.currentPrice, 0) / propertiesPricing.length 
    : 0;
  
  const avgOccupancy = propertiesPricing.length > 0
    ? propertiesPricing.reduce((sum, p) => sum + p.occupancyRate, 0) / propertiesPricing.length
    : 0;

  const toAdjustCount = propertiesPricing.filter(p => p.currentPrice !== p.suggestedPrice).length;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pricing Optimization</h2>
          <p className="text-muted-foreground">Optimize pricing based on market trends and occupancy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Average Price</CardTitle>
            <CardDescription>Current average nightly price</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${avgPrice.toFixed(0)}
            </div>
            <p className="text-sm text-muted-foreground">Average price</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Occupancy</CardTitle>
            <CardDescription>Average occupancy rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(avgOccupancy)}%
            </div>
            <p className="text-sm text-muted-foreground">Average occupancy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Properties to Adjust</CardTitle>
            <CardDescription>Properties with pricing recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {toAdjustCount}
            </div>
            <p className="text-sm text-muted-foreground">Properties to adjust</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Potential Revenue Increase</CardTitle>
            <CardDescription>Estimated revenue improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+12.5%</div>
            <p className="text-sm text-muted-foreground">Projected increase</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Recommendations</CardTitle>
          <CardDescription>Optimal pricing for each property</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Suggested Price</TableHead>
                <TableHead>Difference</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>Demand</TableHead>
                <TableHead>Competitor Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propertiesPricing.map((pricing) => (
                <TableRow key={pricing.id}>
                  <TableCell className="font-medium">{pricing.property}</TableCell>
                  <TableCell>${pricing.currentPrice.toFixed(2)}</TableCell>
                  <TableCell>${pricing.suggestedPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={pricing.suggestedPrice > pricing.currentPrice ? 'default' : 'destructive'}>
                      {pricing.suggestedPrice > pricing.currentPrice ? '+' : ''}
                      {((pricing.suggestedPrice - pricing.currentPrice) / pricing.currentPrice * 100).toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>{pricing.occupancyRate}%</TableCell>
                  <TableCell>
                    <Badge variant={demandColors[pricing.demandLevel] as any}>
                      {demandLabels[pricing.demandLevel]}
                    </Badge>
                  </TableCell>
                  <TableCell>${pricing.competitorPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('View', pricing.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {pricing.currentPrice !== pricing.suggestedPrice && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => console.log('Edit', pricing.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Adjust
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Strategy Tips</CardTitle>
          <CardDescription>Recommendations for pricing optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900">High Demand Properties</h3>
              <p className="text-sm text-blue-700">
                Consider increasing prices by 5-10% to maximize revenue without significantly affecting occupancy.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-900">Low Occupancy Properties</h3>
              <p className="text-sm text-yellow-700">
                Consider decreasing prices by 10-15% or offering promotions to increase bookings.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900">Competitor Analysis</h3>
              <p className="text-sm text-green-700">
                Monitor competitor pricing and adjust your rates to stay competitive in the market.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900">Dynamic Pricing</h3>
              <p className="text-sm text-purple-700">
                Implement dynamic pricing based on seasonal demand, events, and market conditions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
