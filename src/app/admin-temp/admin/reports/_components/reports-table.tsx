'use client';

import { useUpdateReportStatus } from '@/app/(admin)/_api/use-update-report-status';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { DateToString } from '@/types/helper';
import type { FAQ, Post, Reports, ReportUpdateLog, User } from '@prisma/client';
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
import { ExternalLink, FileQuestion, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ReportTableProps extends DateToString<Reports> {
  user: DateToString<User>;
  post: DateToString<
    Post & {
      creator: User;
    }
  >;
  faqs: DateToString<FAQ>[];
  ReportUpdateLog: DateToString<ReportUpdateLog & { user: User }>[];
}

const columns: ColumnDef<ReportTableProps>[] = [
  {
    accessorKey: 'reason',
    header: 'Reason',
  },
  {
    accessorKey: 'post.id',
    header: 'Posted Id',
  },
  {
    accessorKey: 'post.creator.email',
    header: 'Post By',
  },
  {
    accessorKey: 'post.approvalStatus',
    header: 'Post Status',
  },
  {
    accessorKey: 'user.email',
    header: 'Reported By',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const report = row.original;

      return <Actions report={report} />;
    },
  },
];

export function ReportsTable({ data = [] }: { data?: ReportTableProps[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
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

  return (
    <TooltipProvider>
      <div className='w-full'>
        <div className='flex items-center py-4'>
          <Input
            placeholder='Filter reports...'
            value={
              (table.getColumn('reason')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('reason')?.setFilterValue(event.target.value)
            }
            className='max-w-sm'
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='ml-auto'>
                Columns
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
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
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
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className='flex items-center justify-end space-x-2 py-4'>
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
    </TooltipProvider>
  );
}

export function Actions({ report }: { report: ReportTableProps }) {
  const router = useRouter();
  const { mutate, isPending } = useUpdateReportStatus(report.id);
  const [showLogs, setShowLogs] = useState(false);

  return (
    <div>
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Actions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenuContent align='end'>
          <Link href={`/admin/posts?id=${report.post.id}`}>
            <DropdownMenuItem>
              <ExternalLink className='mr-2 h-4 w-4' />
              <span>Visit Post</span>
            </DropdownMenuItem>
          </Link>

          <Dialog>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <FileQuestion className='mr-2 h-4 w-4' />
                <span>View Questionnaire</span>
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle>Report Questionnaire</DialogTitle>
              </DialogHeader>
              <div className='space-y-4 py-4'>
                {report.faqs.map((faq) => (
                  <div key={faq.id} className='space-y-2'>
                    <h3 className='font-medium'>{faq.question}</h3>
                    <p className='text-sm text-muted-foreground'>
                      {faq.answer}
                    </p>
                  </div>
                ))}
                {report.additionalInfo && (
                  <div className='space-y-2'>
                    <h3 className='font-medium'>Additional Info</h3>
                    <p className='text-sm text-muted-foreground'>
                      {report.additionalInfo}
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showLogs} onOpenChange={setShowLogs}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <FileQuestion className='mr-2 h-4 w-4' />
                <span>View Update Logs</span>
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle>Report Update Logs</DialogTitle>
              </DialogHeader>
              <div className='space-y-4 py-4 max-h-[60vh] overflow-y-auto'>
                {report.ReportUpdateLog && report.ReportUpdateLog.length > 0 ? (
                  report.ReportUpdateLog.map((log) => (
                    <div key={log.id} className='space-y-2 border-b pb-3'>
                      <div className='flex justify-between'>
                        <h3 className='font-medium'>{log.user.email}</h3>
                        <p className='text-xs text-muted-foreground'>
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className='text-sm'>{log.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No update logs found.
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <span className='flex items-center'>
                  Change Status
                  {isPending && <span className='ml-2 animate-spin'>⏳</span>}
                </span>
              </DropdownMenuItem>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => mutate({ status: 'APPROVED' })}
                disabled={report.status === 'APPROVED' || isPending}
              >
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => mutate({ status: 'REJECTED' })}
                disabled={report.status === 'REJECTED' || isPending}
              >
                Reject
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => mutate({ status: 'PENDING' })}
                disabled={report.status === 'PENDING' || isPending}
              >
                Mark as Pending
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
