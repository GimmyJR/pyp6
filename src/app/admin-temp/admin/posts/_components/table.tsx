'use client';

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, Search, X } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DateToString } from '@/types/helper';
import { ApprovalStatus, Post, User } from '@prisma/client';
import { format } from 'date-fns';
import { PostActions } from './actions';

export function PostsTable({
  posts,
}: {
  posts: DateToString<
    Post & {
      creator: User;
    }
  >[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State for table
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // State for filters (moved from URL params to local state)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Image preview state
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  // Handle ID filter through URL params
  const handleIdFilter = (id: string) => {
    router.push(pathname + '?' + createQueryString('id', id));
  };

  const columns: ColumnDef<
    DateToString<
      Post & {
        creator: User;
      }
    >
  >[] = [
    {
      accessorKey: 'image',
      header: 'Image',
      cell: ({ row }) => (
        <div
          className='relative h-16 w-16 cursor-pointer'
          onClick={() => setImagePreview(row.getValue('image'))}
        >
          <Image
            src={row.getValue('image') || '/placeholder.svg?height=64&width=64'}
            alt={row.original.caption || 'Post image'}
            fill
            className='rounded-md object-cover'
          />
        </div>
      ),
    },
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <div className='font-medium'>{row.getValue('id')}</div>
      ),
    },
    {
      accessorKey: 'caption',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Caption
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className='max-w-[300px] truncate'>
          {row.getValue('caption') || 'No caption'}
        </div>
      ),
    },
    {
      id: 'creatorName', // Give it a specific ID
      accessorFn: (row) => row.creator?.name, // Safely access with optional chaining
      header: 'Creator Name',
      cell: ({ row }) => <div>{row.getValue('creatorName')}</div>,
    },
    {
      id: 'creatorEmail', // Give it a specific ID
      accessorFn: (row) => row.creator?.email, // Safely access with optional chaining
      header: 'Creator Email',
      cell: ({ row }) => <div>{row.getValue('creatorEmail')}</div>,
    },
    {
      accessorKey: 'approvalStatus',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('approvalStatus') as ApprovalStatus;

        return (
          <Badge
            variant={
              status === 'APPROVED'
                ? 'success'
                : status === 'REJECTED'
                  ? 'destructive'
                  : 'outline'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'totalVotes',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Votes
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue('totalVotes')}</div>,
    },
    {
      accessorKey: 'impressions',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Impressions
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue('impressions')}</div>,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Created
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return <div>{format(new Date(date), 'dd MMM, yy')}</div>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => <PostActions post={row.original} />,
    },
  ];

  const table = useReactTable({
    data: posts,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  // Apply filters when component mounts or URL params change
  useEffect(() => {
    // Get ID filter value from URL search params
    const idParam = searchParams.get('id');

    // Clear existing filters first
    table.resetColumnFilters();

    // Apply ID filter if present (only filter from URL)
    if (idParam) {
      table.getColumn('id')?.setFilterValue(idParam);
    }

    // Initialize local state filters from URL for first render (for backwards compatibility)
    if (!searchTerm) {
      const initialSearchTerm = searchParams.get('search') || '';
      setSearchTerm(initialSearchTerm);
      if (initialSearchTerm) {
        table.getColumn('caption')?.setFilterValue(initialSearchTerm);
      }
    }

    if (statusFilter === 'all') {
      const initialStatus = searchParams.get('status') || 'all';
      setStatusFilter(initialStatus);
      if (initialStatus && initialStatus !== 'all') {
        table.getColumn('approvalStatus')?.setFilterValue(initialStatus);
      }
    }
  }, [searchParams, table, searchTerm, statusFilter]);

  // Apply filters when local state changes
  useEffect(() => {
    // Apply search filter to caption
    if (searchTerm) {
      table.getColumn('caption')?.setFilterValue(searchTerm);
    } else {
      table.getColumn('caption')?.setFilterValue('');
    }

    // Apply status filter if not "all"
    if (statusFilter && statusFilter !== 'all') {
      table.getColumn('approvalStatus')?.setFilterValue(statusFilter);
    } else {
      table.getColumn('approvalStatus')?.setFilterValue('');
    }
  }, [searchTerm, statusFilter, table]);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex flex-1 items-center space-x-2'>
          <div className='relative w-full'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search posts...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-8'
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Statuses</SelectItem>
              <SelectItem value='PENDING'>Pending</SelectItem>
              <SelectItem value='APPROVED'>Approved</SelectItem>
              <SelectItem value='REJECTED'>Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='ml-auto'>
              Columns <ChevronDown className='ml-2 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='flex-1 text-sm text-muted-foreground'>
          {table.getFilteredRowModel().rows.length} total rows
        </div>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      {/* Image Preview Modal */}
      {imagePreview && (
        <div
          className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'
          onClick={() => setImagePreview(null)}
        >
          <div className='relative max-w-3xl max-h-[90vh] p-2 bg-white dark:bg-gray-900 rounded-lg'>
            <Button
              variant='ghost'
              size='icon'
              className='absolute right-2 top-2 z-10 bg-white/80 dark:bg-gray-800/80 rounded-full'
              onClick={() => setImagePreview(null)}
            >
              <X className='h-4 w-4' />
              <span className='sr-only'>Close</span>
            </Button>
            <div className='relative h-[80vh] w-[80vw] max-w-3xl'>
              <Image
                src={imagePreview || '/placeholder.svg'}
                alt='Preview'
                fill
                className='object-contain rounded-md'
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
