'use client';

import { useGetTransactions } from '../../_api/use-get-transactions';
import { columns } from './_components/columns';
import { DataTable } from './_components/data-table';

export default function TransactionsPage() {
  const { data, isLoading } = useGetTransactions();

  if (isLoading) {
    return <>loading...</>;
  }

  if (!data) {
    return <>no data</>;
  }

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-2xl font-bold mb-4'>Transactions</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
