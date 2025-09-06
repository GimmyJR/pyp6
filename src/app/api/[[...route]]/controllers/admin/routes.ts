import { AuthorizeRole } from '@/app/api/[[...route]]/middleware';
import { Hono } from 'hono';
import {
  comment,
  milestone,
  moderators,
  post,
  reports,
  statistics,
  tip,
  transaction,
  user,
  contact
} from '.';

const app = new Hono()
  .use(AuthorizeRole(['ADMIN']))
  .route('/user', user)
  .route('/comment', comment)
  .route('/statistics', statistics)
  .route('/reports', reports)
  .route('/moderators', moderators)
  .route('/post', post)
  .route('/transaction', transaction)
  .route('/tip', tip)
  .route('/milestone', milestone).route('/contact' , contact);

export default app;
