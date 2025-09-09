'use client';

import { useGetContactRequests } from '../../_api/use-get-contact-requests';
import { columns } from './_components/contact-column';
import { ContactTable } from './_components/contact-table';

export default function ContactRequestsPage() {
  const { data, isLoading } = useGetContactRequests();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-2xl font-bold mb-4'>Moderator Applications</h1>
      {data ? (
        <ContactTable columns={columns} data={data} />
      ) : (
        <div>No applications available</div>
      )}
    </div>
  );
}
