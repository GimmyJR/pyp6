import { Hono } from 'hono';
import { milestone, payout, post, profile, tip, transaction } from '.';

const app = new Hono()
  .route('/post', post)
  .route('/profile', profile)
  .route('/transaction', transaction)
  .route('/payout', payout)
  .route('/tip', tip)
  .route('/milestone', milestone);

export default app;
