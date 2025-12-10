/**
 * Job queue names for Bull queue registration
 */
export const JOB_QUEUES = {
  OVERDUE_REMINDERS: 'overdue-reminders',
  SESSION_CLEANUP: 'session-cleanup',
  CREDIT_REVIEW: 'credit-review',
} as const;

/**
 * Process names for Bull job processors
 */
export const JOB_PROCESSES = {
  PROCESS_OVERDUE_REMINDERS: 'process-overdue-reminders',
  PROCESS_SESSION_CLEANUP: 'process-session-cleanup',
  PROCESS_CREDIT_REVIEW: 'process-credit-review',
} as const;

export type JobQueueName = (typeof JOB_QUEUES)[keyof typeof JOB_QUEUES];
export type JobProcessName = (typeof JOB_PROCESSES)[keyof typeof JOB_PROCESSES];
