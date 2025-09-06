'use client';

import { Sidebar, SidebarContent, SidebarRail } from '@/components/ui/sidebar';
import { Images, MessageCircle } from 'lucide-react';
import { NavMain } from './nav-main';

const data = {
  navMain: [
    {
      title: 'Posts',
      url: '/moderator/posts',
      icon: Images,
    },
    {
      title: 'Comments',
      url: '/moderator/comments',
      icon: MessageCircle,
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
