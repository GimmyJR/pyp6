'use client';

import { useGetReports } from '../../_api/use-get-reports';
import { ReportsTable } from './_components/reports-table';

export default function AdminReportsPage() {
  const { data, isLoading } = useGetReports();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-5'>User Reports</h1>
      <p className='text-gray-600 mb-8'>
        Review and manage reports submitted by users on posts. Use the table
        below to filter, sort, and take action on reported content.
      </p>
      <ReportsTable data={data} />
    </div>
  );
}
