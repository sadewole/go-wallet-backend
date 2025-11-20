import {
  integer,
  pgEnum,
  pgTable,
  text,
  uuid,
  timestamp,
  json,
  index,
  uniqueIndex,
  AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { users } from './users';
import { timestamps } from '../utils/timestamps';

export const statusEnum = pgEnum('status', ['active', 'suspended', 'closed']);
export const applicationStatusEnum = pgEnum('application_status', [
  'pending',
  'under_review',
  'approved',
  'rejected',
]);
export const transactionTypeEnum = pgEnum('transaction_type', [
  'drawdown',
  'repayment',
  'adjustment',
]);
// Enum for timeline entity types
export const timelineEntityTypeEnum = pgEnum('timeline_entity_type', [
  'credit_application',
  'credit_request',
]);

export const credits = pgTable(
  'credits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    limit: integer('limit').notNull(), // given on credit application
    spendableAmount: integer('spendable_amount').notNull(), // remaining (credit-request) approved amount left to spend. does not reduce on payment
    outstanding: integer('outstanding').notNull(), // total amount owed at any point in time
    available: integer('available').notNull(), // limit - outstanding
    status: statusEnum('status').notNull().default('active'),
    userId: uuid('user_id')
      .references((): AnyPgColumn => users.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    ...timestamps,
  },
  (table) => [
    index('credits_user_id_idx').on(table.userId),
    index('credits_status_idx').on(table.status),
    // Compound index for common queries
    index('credits_user_status_idx').on(table.userId, table.status),
  ],
);

export const creditApplications = pgTable(
  'credit_applications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bvn: text('bvn').notNull(),
    businessDocs: json('business_docs').notNull().default([]),
    applicationAmount: integer('application_amount').notNull(),
    approvedAmount: integer('approved_amount'),
    approvedDate: timestamp('approved_date'),
    status: applicationStatusEnum('status').notNull().default('pending'),
    rejectionReason: text('rejection_reason'),
    purposeOfLoan: text('rejection_reason'),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    ...timestamps,
  },
  (table) => [
    index('credit_applications_user_id_idx').on(table.userId),
    index('credit_applications_status_idx').on(table.status),
    index('credit_applications_bvn_idx').on(table.bvn),
    index('credit_applications_created_at_idx').on(table.createdAt),
    // Prevent duplicate pending applications from same user
    uniqueIndex('credit_applications_user_pending_idx')
      .on(table.userId)
      .where(sql`status = 'pending'`),
  ],
);

export const creditRequests = pgTable(
  'credit_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    requestAmount: integer('request_amount').notNull(),
    approvedAmount: integer('approved_amount'),
    creditId: uuid('credit_id')
      .references(() => credits.id, { onDelete: 'cascade' })
      .notNull(),
    status: applicationStatusEnum('status').notNull().default('pending'),
    rejectionReason: text('rejection_reason'),
    ...timestamps,
  },
  (table) => [
    index('credit_request_credit_id_idx').on(table.creditId),
    index('credit_request_status_idx').on(table.status),
    index('credit_request_created_at_idx').on(table.createdAt),
    // Prevent duplicate pending requests from same user
    uniqueIndex('credit_request_user_pending_idx')
      .on(table.creditId)
      .where(sql`status = 'pending'`),
  ],
);

// polymorphic relationship for the timeline that can handle both credit applications and credit requests
export const creditTimeline = pgTable(
  'credit_timeline',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Polymorphic relationship fields
    entityType: timelineEntityTypeEnum('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    status: applicationStatusEnum('status').notNull(),
    changedBy: uuid('changed_by').references(() => users.id),
    note: text('note'),
    metadata: json('metadata'),
    ...timestamps,
  },
  (table) => [
    index('credit_timeline_entity_idx').on(table.entityType, table.entityId),
    index('credit_timeline_status_idx').on(table.status),
    index('credit_timeline_created_at_idx').on(table.createdAt),
    index('credit_timeline_changed_by_idx').on(table.changedBy),
    // Compound index for efficient queries by entity type and ID
    index('credit_timeline_entity_composite_idx').on(
      table.entityType,
      table.entityId,
      table.createdAt,
    ),
  ],
);

export const creditTransactions = pgTable(
  'credit_transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    creditId: uuid('credit_id')
      .references(() => credits.id, { onDelete: 'cascade' })
      .notNull(),
    amount: integer('amount').notNull(),
    type: transactionTypeEnum('type').notNull(),
    runningBalance: integer('running_balance').notNull(),
    description: text('description'),
    reference: text('reference').unique(),
    metadata: json('metadata'),
    ...timestamps,
  },
  (table) => [
    index('credit_tx_credit_id_idx').on(table.creditId),
    index('credit_tx_type_idx').on(table.type),
    index('credit_tx_created_at_idx').on(table.createdAt),
    index('credit_tx_reference_idx').on(table.reference),
    // Compound index for transaction history queries
    index('credit_tx_credit_created_idx').on(table.creditId, table.createdAt),
  ],
);

// Relations
export const creditRelations = relations(credits, ({ one, many }) => ({
  user: one(users, {
    fields: [credits.userId],
    references: [users.id],
  }),
  transactions: many(creditTransactions),
  creditRequests: many(creditRequests),
}));

export const creditApplicationsRelations = relations(
  creditApplications,
  ({ one, many }) => ({
    user: one(users, {
      fields: [creditApplications.userId],
      references: [users.id],
    }),
    timeline: many(creditTimeline, {
      relationName: 'application_timeline',
    }),
  }),
);

export const creditTimelineRelations = relations(creditTimeline, ({ one }) => ({
  // These relations are optional and for type safety
  creditApplication: one(creditApplications, {
    fields: [creditTimeline.entityId],
    references: [creditApplications.id],
    relationName: 'application_timeline',
  }),
  creditRequest: one(creditRequests, {
    fields: [creditTimeline.entityId],
    references: [creditRequests.id],
    relationName: 'request_timeline',
  }),
  changedByUser: one(users, {
    fields: [creditTimeline.changedBy],
    references: [users.id],
  }),
}));

export const creditRequestsRelations = relations(
  creditRequests,
  ({ one, many }) => ({
    credit: one(credits, {
      fields: [creditRequests.creditId],
      references: [credits.id],
    }),
    timeline: many(creditTimeline, {
      relationName: 'request_timeline',
    }),
  }),
);

export const creditTransactionsRelations = relations(
  creditTransactions,
  ({ one }) => ({
    credit: one(credits, {
      fields: [creditTransactions.creditId],
      references: [credits.id],
    }),
  }),
);
