import * as userSchema from '../../users/schema';

export const DATABASE_CONNECTION = 'database-connection';

export const schemas = {
  ...userSchema,
};
export type DatabaseSchema = typeof schemas;
