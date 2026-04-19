'use client';

import PageContainer from "../../../components/layout/page-container";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction
} from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { AreaGraph } from './area-graph';
import { BarGraph } from './bar-graph';
import { PieGraph } from './pie-graph';
import { RecentSales } from './recent-sales';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { Badge } from "../../../components/ui/badge";
import { useExecutiveOverview } from "@/app/admin/hooks/use-executive-overview";

export default function OverViewPage() {
  const { data: apiResponse, isLoading, error } = useExecutiveOverview('30d');
  const data = apiResponse?.data;

  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>Loading Dashboard...</h2>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col space-y-2 text-red-500'>
          <h2 className='text-2xl font-bold tracking-tight'>Error Loading Dashboard</h2>
          <p>{error.message}</p>
        </div>
      </PageContainer>
    );
  }

  const metrics = data?.metrics;

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Hi, Welcome back 👋
          </h2>
          <div className='hidden items-center space-x-2 md:flex'>
            <Button>Download</Button>
          </div>
        </div>
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='analytics' disabled>
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value='overview' className='space-y-4'>
            <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
              <Card className='@container/card'>
                <CardHeader>
                  <CardDescription>Total Revenue</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                    ${metrics?.totalRevenue?.toLocaleString() || '0.00'}
                  </CardTitle>
                  <CardAction>
                    <Badge variant='outline'>
                      {metrics?.revenueGrowthPercentage && metrics.revenueGrowthPercentage >= 0 ? (
                        <IconTrendingUp className="text-emerald-500" />
                      ) : (
                        <IconTrendingDown className="text-rose-500" />
                      )}
                      {metrics?.revenueGrowthPercentage || 0}%
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 flex gap-2 font-medium'>
                    {metrics?.revenueGrowthPercentage && metrics.revenueGrowthPercentage >= 0 ? 'Trending up' : 'Trending down'} this month 
                    {metrics?.revenueGrowthPercentage && metrics.revenueGrowthPercentage >= 0 ? <IconTrendingUp className='size-4 text-emerald-500' /> : <IconTrendingDown className='size-4 text-rose-500' />}
                  </div>
                  <div className='text-muted-foreground'>
                    Revenue for the last 30 days
                  </div>
                </CardFooter>
              </Card>
              <Card className='@container/card'>
                <CardHeader>
                  <CardDescription>New Customers</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                    {metrics?.newUsers?.toLocaleString() || '0'}
                  </CardTitle>
                  <CardAction>
                    <Badge variant='outline'>
                      {metrics?.userGrowthPercentage && metrics.userGrowthPercentage >= 0 ? (
                        <IconTrendingUp className="text-emerald-500" />
                      ) : (
                        <IconTrendingDown className="text-rose-500" />
                      )}
                      {metrics?.userGrowthPercentage || 0}%
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 flex gap-2 font-medium'>
                    {metrics?.userGrowthPercentage && metrics.userGrowthPercentage >= 0 ? 'Growing' : 'Slowing'} this period 
                    {metrics?.userGrowthPercentage && metrics.userGrowthPercentage >= 0 ? <IconTrendingUp className='size-4 text-emerald-500' /> : <IconTrendingDown className='size-4 text-rose-500' />}
                  </div>
                  <div className='text-muted-foreground'>
                    New users this month
                  </div>
                </CardFooter>
              </Card>
              <Card className='@container/card'>
                <CardHeader>
                  <CardDescription>Active Accounts</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                    {metrics?.activeUsers?.toLocaleString() || '0'}
                  </CardTitle>
                  <CardAction>
                    <Badge variant='outline'>
                      <IconTrendingUp className="text-emerald-500" />
                      Active
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 flex gap-2 font-medium'>
                    Strong user retention <IconTrendingUp className='size-4 text-emerald-500' />
                  </div>
                  <div className='text-muted-foreground'>
                    Accounts active in last 30 days
                  </div>
                </CardFooter>
              </Card>
              <Card className='@container/card'>
                <CardHeader>
                  <CardDescription>Active Properties</CardDescription>
                  <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                    {metrics?.totalListings?.toLocaleString() || '0'}
                  </CardTitle>
                  <CardAction>
                    <Badge variant='outline'>
                      <IconTrendingUp className="text-emerald-500" />
                      +{metrics?.newListings || 0}
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                  <div className='line-clamp-1 flex gap-2 font-medium'>
                    Steady inventory growth{' '}
                    <IconTrendingUp className='size-4 text-emerald-500' />
                  </div>
                  <div className='text-muted-foreground'>
                    Total active listings on platform
                  </div>
                </CardFooter>
              </Card>
            </div>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              <div className='col-span-4'>
                <BarGraph data={data?.charts?.revenue} />
              </div>
              <Card className='col-span-4 md:col-span-3'>
                <RecentSales data={data?.recentSales} />
              </Card>
              <div className='col-span-4'>
                <AreaGraph data={data?.charts?.revenue} />
              </div>
              <div className='col-span-4 md:col-span-3'>
                <PieGraph data={data?.charts?.propertyDistribution} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
