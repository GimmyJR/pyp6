import { Post, User, Vote } from '@prisma/client';
import { DateToString } from './helper';

export type PostWithRelations = DateToString<Post> & {
  _count: {
    vote: number;
  };
  creator: DateToString<User>;
  vote: (DateToString<Vote> & {
    voter: DateToString<User> | null;
  })[];
};
