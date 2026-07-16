'use client';

import React from 'react';
import PageContainer from '@/app/admin/components/layout/page-container';
import AuditLogs from '@/app/admin/features/monitoring/components/audit-logs';

export default function AuditLogsPage() {
  return (
    <PageContainer
      pageTitle="Audit Logs"
      pageDescription="Immutable record of administrative actions across the platform"
    >
      <AuditLogs />
    </PageContainer>
  );
}
