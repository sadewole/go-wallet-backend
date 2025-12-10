export const notificationType = {
  emailVerification: {
    showCode: true,
    subject: 'Go-wallet account Verification',
    header: 'Email verification',
    body: 'Use this code in the verification form to confirm it is you.',
  },
  emailVerified: {
    showCode: false,
    subject: 'Congratulations! Your account has been verified.',
    header: 'Account verified',
    body: 'You can now enjoy exclusive features on Go-wallet. This email would serve as your account recovery detail.',
  },
  thankYouSignUp: {
    showCode: true,
    subject: 'Welcome to Go-wallet!. Verify your email',
    header: 'Thank you for signing up',
    body: 'To enjoy exclusive features on Go-wallet, please use the code below to confirm your email',
  },
  passwordReset: {
    showCode: true,
    subject: 'Password Reset Request',
    header: 'Password reset',
    body: 'You have requested password reset for your Go-wallet account. Use the code below to reset your password',
  },
  creditApproved: {
    showCode: false,
    subject: 'Congratulation!, Your credit limit application has been approved',
    header: 'Credit limit approved',
    body: 'Your credit limit application has been approved. You can now access your increased credit limit on Go-wallet.',
  },
  creditRejected: {
    showCode: false,
    subject: 'Update on your credit limit application',
    header: 'Credit limit application update',
    body: 'We regret to inform you that your credit limit application has been rejected. For more details, please log in to your Go-wallet account.',
  },
  creditRequestApproved: {
    showCode: false,
    subject: 'Congratulation!, Your credit request has been approved',
    header: 'Credit request approved',
    body: 'Your credit request has been approved. The requested amount has been added to your credit account on Go-wallet.',
  },
  creditRequestRejected: {
    showCode: false,
    subject: 'Update on your credit request',
    header: 'Credit request update',
    body: 'We regret to inform you that your credit request has been rejected. For more details, please log in to your Go-wallet account.',
  },
  overduePaymentReminder: {
    showCode: false,
    subject: 'Payment Reminder: Outstanding Balance on Your Account',
    header: 'Payment Reminder',
    body: 'This is a friendly reminder that you have an outstanding balance on your Go-wallet credit account. Please log in to make a payment and avoid any potential late fees.',
  },
  staleCreditReviewAlert: {
    showCode: false,
    subject: 'Action Required: Pending Credit Applications Need Review',
    header: 'Credit Applications Awaiting Review',
    body: 'The following credit applications and requests have been pending for an extended period and require your attention. Please log in to the admin panel to review them.',
  },
} as const;

export type NotificationType = keyof typeof notificationType;
