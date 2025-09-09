'use client';

import { Sidebar, SidebarContent, SidebarRail } from '@/components/ui/sidebar';
import {
  Award,
  BadgeCent,
  ChartNoAxesColumn,
  Contact,
  DollarSign,
  FilePlus2,
  FileText,
  Images,
  MessagesSquare,
  Users,
} from 'lucide-react';
import { NavMain } from './nav-main';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: ChartNoAxesColumn,
    },
    {
      title: 'Users',
      url: '/admin/users',
      icon: Users,
    },
    {
      title: 'Posts',
      url: '/admin/posts',
      icon: Images,
    },
    {
      title: 'Comments',
      url: '/admin/comments',
      icon: MessagesSquare,
    },
    {
      title: 'Reports',
      url: '/admin/reports',
      icon: FileText,
    },
    {
      title: 'Moderator applications',
      url: '/admin/moderator/applications',
      icon: FilePlus2,
    },
    {
      title: 'Transactions',
      url: '/admin/transactions',
      icon: DollarSign,
    },
    {
      title: 'Tips',
      url: '/admin/tips',
      icon: BadgeCent,
    },
    {
      title: 'Milestones',
      url: '/admin/milestones',
      icon: Award,
    },
    {
      title: 'Contact Requests',
      url: '/admin/contact',
      icon: Contact,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className='border-r-0' {...props}>
      <SidebarContent className='p-3'>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
