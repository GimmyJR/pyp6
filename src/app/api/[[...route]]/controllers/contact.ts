import { db } from '@/lib/db';
import { ContactFormSchema } from '@/schemas';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

const app = new Hono()
  .get('/', (c) => {
    return c.json({ message: 'Contact API endpoint' });
  })
  .post('/', zValidator('json', ContactFormSchema), async (c) => {
    const body = c.req.valid('json');

    // Create new contact record in the database
    const contact = await db.contact.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        inquiryType: body.inquiryType,
        subject: body.subject,
        message: body.message,
      },
    });

    return c.json(
      {
        success: true,
        message: 'Contact form submitted successfully',
        contactId: contact.id,
      },
      201
    );
  });

export default app;
