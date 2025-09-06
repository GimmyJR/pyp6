import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

import { UserRound } from 'lucide-react';

const UserAvatar = ({
  src,
  name,
  className,
  style,
  size = 24,
}: {
  src?: string | null;
  name?: string | null;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}) => {
  return (
    <Avatar style={style} className={className}>
      <AvatarImage src={src ?? undefined} alt={name ?? undefined} />
      <AvatarFallback>
        {name ? name[0].toUpperCase() : <UserRound size={size} />}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
