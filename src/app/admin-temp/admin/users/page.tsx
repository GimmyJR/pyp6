'use client';

import { useGetUsers } from '@/app/(admin)/_api/use-get-users';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole } from '@prisma/client';
import { format } from 'date-fns';
import {
  Calendar,
  Heart,
  Info,
  Mail,
  MapPin,
  MoreHorizontal,
  Search,
  User,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useOpenUser } from '../../_hooks/use-open-user';

export default function UsersPage() {
  const { data: users, isLoading } = useGetUsers();
  const { onOpen } = useOpenUser();

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('');

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant='destructive'>Admin</Badge>;
      case 'MODERATOR':
        return <Badge variant='secondary'>Moderator</Badge>;
      default:
        return <Badge variant='outline'>User</Badge>;
    }
  };

  const calculateAge = (birthYear: Date) => {
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear.getFullYear();
  };

  // Get unique locations for the filter dropdown
  const uniqueLocations = useMemo(() => {
    if (!users) return [];
    const locations = users
      .map((user) => user.location)
      .filter(Boolean) as string[];
    return Array.from(new Set(locations)).sort();
  }, [users]);

  // Filter users based on search term and filters
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter((user) => {
      // Search term filter
      const searchMatch =
        searchTerm === '' ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchTerm.toLowerCase());

      // Role filter
      const roleMatch = roleFilter === 'ALL' || user.role === roleFilter;

      // Location filter
      const locationMatch =
        locationFilter === '' || user.location === locationFilter;

      return searchMatch && roleMatch && locationMatch;
    });
  }, [users, searchTerm, roleFilter, locationFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('ALL');
    setLocationFilter('');
  };

  if (isLoading) return <div>Loading...</div>;

  if (!users) return null;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Users Management</h1>
      </div>

      {/* Search and Filter Section */}
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <div className='relative flex-grow'>
            <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search by name, username, email or bio...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className='w-40'>
              <SelectValue placeholder='Role' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='ALL'>All Roles</SelectItem>
                <SelectItem value='USER'>User</SelectItem>
                <SelectItem value='MODERATOR'>Moderator</SelectItem>
                <SelectItem value='ADMIN'>Admin</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className='w-40'>
              <SelectValue placeholder='Location' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value=''>All Locations</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select> */}

          {(searchTerm || roleFilter !== 'ALL' || locationFilter !== '') && (
            <Button variant='ghost' size='sm' onClick={clearFilters}>
              <X className='mr-2 h-4 w-4' />
              Clear
            </Button>
          )}
        </div>

        <div className='flex items-center text-sm text-muted-foreground'>
          <span>
            Showing {filteredUsers.length} of {users.length} users
          </span>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className='flex h-40 items-center justify-center rounded-md border border-dashed'>
          <p className='text-muted-foreground'>No users match your filters</p>
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {filteredUsers.map((user) => (
            <Card key={user.id} className='flex flex-col'>
              <CardHeader className='flex-row justify-between'>
                <div className='flex items-center space-x-4'>
                  <Avatar>
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name ?? ''}
                    />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{user.name}</CardTitle>
                    {user.username && (
                      <CardDescription>@{user.username}</CardDescription>
                    )}
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => onOpen(user.id)}
                >
                  <MoreHorizontal className='size-4' />
                </Button>
              </CardHeader>
              <CardContent className='flex-grow'>
                <div className='space-y-2'>
                  <div className='flex items-center'>
                    <Mail className='mr-2 h-4 w-4' />
                    <span className='text-sm'>{user.email}</span>
                  </div>
                  <div className='flex items-center'>
                    <User className='mr-2 h-4 w-4' />
                    <span className='text-sm'>
                      {user.gender},{' '}
                      {calculateAge(new Date(user.dateOfBirth ?? ''))} years old
                    </span>
                  </div>
                  <div className='flex items-center'>
                    <Heart className='mr-2 h-4 w-4' />
                    <span className='text-sm'>{user.sexualOrientation}</span>
                  </div>
                  <div className='flex items-center'>
                    <MapPin className='mr-2 h-4 w-4' />
                    <span className='text-sm'>{user.location}</span>
                  </div>
                  {user.bio && (
                    <div className='flex items-center'>
                      <Info className='mr-2 h-4 w-4' />
                      <span className='line-clamp-2 text-sm'>
                        {user.bio.slice(0, 40)}
                      </span>
                    </div>
                  )}
                  <div className='flex items-center'>
                    <Calendar className='mr-2 h-4 w-4' />
                    <span className='text-sm'>
                      Joined {format(new Date(user.createdAt), 'dd MMM, yyyy')}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className='flex justify-between'>
                {getRoleBadge(user.role)}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
