'use client';

import { LogoutButton } from '@/app/auth/_components/logout-button';
import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { ChevronDown, LogOut } from 'lucide-react';
import Link from 'next/link';
import Logo from './logo';
import { buttonVariants } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import UserAvatar from './user-avatar';

const Header = () => {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className='mx-auto py-4 max-w-[4000px] '>
      <div className='w-full rounded-full border-2 border-white/10 bg-white/[0.03] p-4 px-8 backdrop-blur-xl'>
        <div className='flex items-center justify-between'>
          <Logo />
          <div className=''>
            {!!user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className='flex items-center gap-2'>
                  <UserAvatar src={user.image} name={user.name} />
                  {user.username || user.name}
                  <ChevronDown className='size-6 text-white' />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <Link href='/profile'>
                    <DropdownMenuItem className='cursor-pointer'>
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href='/billing'>
                    <DropdownMenuItem className='cursor-pointer'>
                      Billing
                    </DropdownMenuItem>
                  </Link>
                  {user.role === UserRole.MODERATOR && (
                    <Link href='/moderator/posts'>
                      <DropdownMenuItem className='cursor-pointer'>
                        Moderator Dashboard
                      </DropdownMenuItem>
                    </Link>
                  )}
                  {user.role === UserRole.ADMIN && (
                    <Link href='/admin'>
                      <DropdownMenuItem className='cursor-pointer'>
                        Admin Dashboard
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <LogoutButton>
                    <DropdownMenuItem className='cursor-pointer'>
                      <LogOut className='rotate-180 size-4' />
                      Sign out
                    </DropdownMenuItem>
                  </LogoutButton>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className='flex items-center gap-4'>
                <Link
                  href='/auth/sign-in'
                  className={buttonVariants({
                    variant: 'ghost',
                    className: '!rounded-full',
                  })}
                >
                  Sign In
                </Link>
                <Link
                  href='/auth/sign-up'
                  className={buttonVariants({
                    variant: 'tertiary',
                    className: '!rounded-full',
                  })}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
