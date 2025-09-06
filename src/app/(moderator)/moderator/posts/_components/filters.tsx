'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function ModeratorFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const handleSearch = (term: string) => {
    setSearch(term);
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (term) {
        params.set('search', term);
      } else {
        params.delete('search');
      }
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleStatusChange = (status: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (status !== 'ALL') {
        params.set('status', status);
      } else {
        params.delete('status');
      }
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className='mb-6 flex flex-col sm:flex-row gap-4'>
      <div className='flex-1'>
        <Input
          type='search'
          placeholder='Search posts...'
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className='w-full'
        />
      </div>
      <Select
        onValueChange={handleStatusChange}
        defaultValue={searchParams.get('status') || 'ALL'}
      >
        <SelectTrigger className='w-full sm:w-[180px]'>
          <SelectValue placeholder='Filter by status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='ALL'>All Posts</SelectItem>
          <SelectItem value='PENDING'>Pending</SelectItem>
          <SelectItem value='REJECTED'>Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
