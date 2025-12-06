import {
  AnyPgColumn,
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { timestamps } from '../utils/timestamps';
import { relations } from 'drizzle-orm';
import { credits, creditTimeline } from './credit';

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
  refreshToken: text('refresh_token'),
  creditId: uuid('credit_id').references((): AnyPgColumn => credits.id),
  ...timestamps,
});

export const usersRelations = relations(users, ({ one, many }) => ({
  credit: one(credits, {
    fields: [users.creditId],
    references: [credits.id],
  }),
  timelineChanges: many(creditTimeline),
}));
