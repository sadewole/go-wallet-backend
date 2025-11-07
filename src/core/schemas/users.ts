import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from '../utils/timestamps';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  password: text('password').notNull(),
  phoneNumber: text('phoneNumber').unique(),
  isVerified: boolean('isVerified').default(false),
  lastLogin: timestamp('last_login'),
  ...timestamps,
});
