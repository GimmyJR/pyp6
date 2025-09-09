'use client';

import { useGetModeratorApplications } from '@/app/(admin)/_api/use-get-moderator-applications';
import { columns } from './_components/colums';
import { DataTable } from './_components/data-table';

export default function ModeratorApplicationsPage() {
  const { data, isLoading } = useGetModeratorApplications();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-2xl font-bold mb-4'>Moderator Applications</h1>
      {data ? (
        <DataTable columns={columns} data={data} />
      ) : (
        <div>No applications available</div>
      )}
    </div>
  );
}
