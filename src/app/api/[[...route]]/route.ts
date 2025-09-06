import { Hono } from 'hono';

import { handle } from 'hono/vercel';

import { HTTPException } from 'hono/http-exception';
import {
  adminRoutes,
  bitpay,
  comment,
  hello,
  moderator,
  moderatorRoutes,
  paypal,
  post,
  report,
  stripe,
  contact,
  tip,
  userRoutes,
  vote,
} from './controllers';

const app = new Hono().basePath('/api');

app.onError((err, c) => {
  console.log(err);

  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  return c.json({ message: 'Internal Error' }, 500);
});

const routes = app
  .route('/hello', hello)
  .route('/moderator', moderator)
  .route('/post', post)
  .route('/comment', comment)
  .route('/vote', vote)
  .route('/report', report)
  .route('/tip', tip)
  .route('/stripe', stripe)
  .route('/bitpay', bitpay)
  .route('/paypal', paypal)
  .route('/contact', contact)
  .route('/user', userRoutes)
  .route('/admin', adminRoutes)
  .route('/moderator', moderatorRoutes);

export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);

export type AppType = typeof routes;