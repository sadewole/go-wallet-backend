import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { timestamps } from '../utils/timestamps';
import { relations } from 'drizzle-orm';
import { credits, creditApplications, creditTimeline } from './credit';

export const roleEnum = pgEnum('role', ['user', 'admin']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  password: text('password').notNull(),
  phoneNumber: text('phoneNumber').unique(),
  isVerified: boolean('isVerified').default(false),
  lastLogin: timestamp('last_login'),
  role: roleEnum('role').default('user').notNull(),
  creditId: uuid('credit_id').references(() => credits.id),
  ...timestamps,
});

export const usersRelations = relations(users, ({ one, many }) => ({
  credit: one(credits),
  creditApplications: many(creditApplications),
  timelineChanges: many(creditTimeline),
}));
