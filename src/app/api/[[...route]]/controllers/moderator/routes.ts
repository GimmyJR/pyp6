import { AuthorizeRole } from '@/app/api/[[...route]]/middleware';
import { Hono } from 'hono';
import { comment, post } from './';

const app = new Hono()
  .use(AuthorizeRole(['MODERATOR', 'ADMIN']))
  .route('/comment', comment)
  .route('/post', post);

export default app;
