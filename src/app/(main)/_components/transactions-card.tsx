'use client';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useGetTransactions } from '../_api/use-get-transactions';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetTips } from '../_api/use-get-tips';
import {
  combinedColumns,
  combineTransactionsAndTips,
} from './combined-tips-transactions-columns';
import { tipColumns } from './tips-column';
import { DataTable } from './transaction-table';
import { columns } from './transactions-columns';

const TransactionCard = () => {
  const { data, isLoading } = useGetTransactions();
  const { data: tips, isLoading: isTipsLoading } = useGetTips();

  const [filterType, setFilterType] = useState('All');

  const handleFilterChange = (value: string) => {
    setFilterType(value);
  };

  const filteredData = data?.filter((transaction) => {
    if (filterType === 'All') return true;
    if (filterType === 'Tips') return false;

    return transaction.type === filterType;
  });

  if (isLoading) {
    return (
      <div className='flex items-center justify-center'>
        <Loader2 className='size-12 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <Card className='border border-white/10 bg-white/[0.03] px-4 py-6 backdrop-blur-xl'>
      <CardHeader className='lg:flex-row lg:justify-between lg:items-center'>
        <CardTitle>Transaction History</CardTitle>
        <Select value={filterType} onValueChange={handleFilterChange}>
          <SelectTrigger className='lg:w-auto border border-white/10 bg-white/[0.03] px-4 py-6 backdrop-blur-xl'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='All'>All</SelectItem>
            <SelectItem value='DEPOSIT'>Deposit</SelectItem>
            <SelectItem value='WITHDRAWAL'>Withdrawal</SelectItem>
            <SelectItem value='Tips'>Tips</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className='space-x-4'>
        {filterType === 'All' ? (
          <DataTable
            columns={combinedColumns}
            data={combineTransactionsAndTips(data || [], tips || [])}
          />
        ) : filterType === 'Tips' ? (
          <DataTable columns={tipColumns} data={tips || []} />
        ) : (
          <DataTable columns={columns} data={filteredData || []} />
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionCard;
