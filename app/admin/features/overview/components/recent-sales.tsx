'use client';

import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from "../../../components/ui/card";
import { useExecutiveOverview } from "@/app/admin/hooks/use-executive-overview";

export function RecentSales({ data: propData }: { data?: any[] }) {
  const { data: apiResponse } = useExecutiveOverview('30d');
  const data = propData || apiResponse?.data?.recentSales || [];
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>Latest successful transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {data && data.length > 0 ? data.map((sale, index) => (
            <div key={index} className='flex items-center'>
              <Avatar className='h-9 w-9'>
                <AvatarImage src={sale.avatar} alt='Avatar' />
                <AvatarFallback>{sale.fallback}</AvatarFallback>
              </Avatar>
              <div className='ml-4 space-y-1'>
                <p className='text-sm leading-none font-medium'>{sale.name}</p>
                <p className='text-muted-foreground text-sm'>{sale.email}</p>
              </div>
              <div className='ml-auto font-medium'>{sale.amount}</div>
            </div>
          )) : (
            <div className='text-center py-10 text-muted-foreground'>
              No recent sales recorded.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
