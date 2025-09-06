'use client';

import { useGetTips } from '../../_api/use-get-tips';
import { TipTable } from './_components/tip-table';

export default function TipPage() {
  const { data, isLoading } = useGetTips();

  if (isLoading) {
    return <>loading...</>;
  }

  if (!data) {
    return <>no data</>;
  }

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-2xl font-bold mb-4'>Tips</h1>
      <TipTable data={data} />
    </div>
  );
}
