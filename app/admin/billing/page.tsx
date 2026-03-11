import PageContainer from "../components/layout/page-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../components/ui/card";

import { Alert, AlertDescription } from "../components/ui/alert";
import { Info } from 'lucide-react';
import { billingInfoContent } from "../config/infoconfig";
import { requireAdmin } from "@/lib/admin";

export default async function BillingPage() {
  // Require admin authentication
  await requireAdmin();

  return (
    <PageContainer
      isloading={false}
      access={true}
      accessFallback={
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='space-y-2 text-center'>
            <h2 className='text-2xl font-semibold'>No Access</h2>
            <p className='text-muted-foreground'>
              You do not have access to view billing information.
            </p>
          </div>
        </div>
      }
      infoContent={billingInfoContent}
      pageTitle='Billing & Plans'
      pageDescription='Manage your subscription and usage limits'
    >
      <div className='space-y-6'>
        {/* Info Alert */}
        <Alert>
          <Info className='h-4 w-4' />
          <AlertDescription>
            Billing and subscription management coming soon.
          </AlertDescription>
        </Alert>

        {/* Placeholder for Billing Content */}
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Choose a plan that fits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='mx-auto max-w-4xl text-center'>
              <p className='text-muted-foreground'>Billing plans will be available soon.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
