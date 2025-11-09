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
} as const;

export type NotificationType = keyof typeof notificationType;
