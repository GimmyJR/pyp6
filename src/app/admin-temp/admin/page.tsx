/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { convertAmountFromMiliunits, formatCurrency } from '@/lib/utils';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useGetStatistics } from '../_api/use-get-statistics';

export default function AdminPage() {
  const { data, isLoading } = useGetStatistics();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No Data Available</div>;
  }

  const { activityData, ...metrics } = data;

  return (
    <div className='flex flex-col space-y-6 p-6 bg-background text-foreground min-h-screen'>
      <h1 className='text-3xl font-bold'>Admin Dashboard</h1>

      {/* Key Metrics */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <MetricCard
          title='Total Users'
          value={metrics.userCount}
          icon='👥'
          subValue={`${metrics.activeUsersLast30Days} active in last 30 days`}
        />
        <MetricCard title='Total Posts' value={metrics.postCount} icon='📝' />
        <MetricCard
          title='Total Comments'
          value={metrics.commentCount}
          icon='💬'
        />
        <MetricCard
          title='Total Tips'
          value={formatCurrency(convertAmountFromMiliunits(metrics.totalTips))}
          icon='💰'
        />
      </div>

      {/* Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>
            Weekly activity for users, posts, comments, and votes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-[400px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={activityData}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='hsl(var(--border))'
                />
                <XAxis dataKey='name' stroke='hsl(var(--muted-foreground))' />
                <YAxis stroke='hsl(var(--muted-foreground))' />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='users'
                  stroke='hsl(var(--chart-1))'
                  strokeWidth={2}
                />
                <Line
                  type='monotone'
                  dataKey='posts'
                  stroke='hsl(var(--chart-2))'
                  strokeWidth={2}
                />
                <Line
                  type='monotone'
                  dataKey='comments'
                  stroke='hsl(var(--chart-3))'
                  strokeWidth={2}
                />
                <Line
                  type='monotone'
                  dataKey='votes'
                  stroke='hsl(var(--chart-4))'
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Post Status */}
      <Card>
        <CardHeader>
          <CardTitle>Post Status</CardTitle>
          <CardDescription>
            Approved, Pending, and Rejected Posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <PostStatusBar
              label='Approved'
              value={metrics.postsApproved}
              total={metrics.postCount}
              color='bg-green-500'
            />
            <PostStatusBar
              label='Pending'
              value={metrics.postsPending}
              total={metrics.postCount}
              color='bg-yellow-500'
            />
            <PostStatusBar
              label='Rejected'
              value={metrics.postsRejected}
              total={metrics.postCount}
              color='bg-red-500'
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <MetricCard title='Total Votes' value={metrics.voteCount} icon='👍' />
        <MetricCard
          title='Votes Given'
          value={metrics.totalVotesGiven}
          icon='⬆️'
        />
        <MetricCard
          title='Votes Received'
          value={metrics.totalVotesReceived}
          icon='⬇️'
        />
        <MetricCard
          title='Avg Rating Given'
          value={parseFloat(metrics.averageRatingGiven.toFixed(2))}
          icon='⭐'
        />
        <MetricCard
          title='Avg Rating Received'
          value={parseFloat(metrics.averageRatingReceived.toFixed(2))}
          icon='🌟'
        />
        <MetricCard
          title='Total Transactions'
          value={metrics.totalTransactions}
          icon='💳'
        />
      </div>

      {/* Moderator Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Moderator Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {metrics.moderatorApplicationsCount}
          </div>
          <p className='text-sm text-muted-foreground'>Pending applications</p>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  subValue,
}: {
  title: string;
  value: number | string;
  icon: string;
  subValue?: string;
}) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <div className='text-2xl'>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        {subValue && (
          <p className='text-xs text-muted-foreground'>{subValue}</p>
        )}
      </CardContent>
    </Card>
  );
}

function PostStatusBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = (value / total) * 100;
  return (
    <div className='space-y-2'>
      <div className='flex justify-between'>
        <span className='text-sm font-medium text-muted-foreground'>
          {label}
        </span>
        <span className='text-sm font-medium text-muted-foreground'>
          {value}
        </span>
      </div>
      <div className='h-2 w-full bg-secondary rounded-full overflow-hidden'>
        <div
          className={`h-full ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-popover p-4 rounded-lg shadow-lg border border-border'>
        <p className='font-bold text-popover-foreground mb-2'>{label}</p>
        {payload.map((pld: any, index: number) => (
          <div key={index} className='flex justify-between items-center mb-1'>
            <span
              className='text-muted-foreground'
              style={{ color: pld.color }}
            >
              {pld.name}:
            </span>
            <span className='font-semibold text-popover-foreground ml-2'>
              {pld.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
