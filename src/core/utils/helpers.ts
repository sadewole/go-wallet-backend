export function excludeProps<T, Key extends keyof T>(
  field: T,
  keys: Key[],
): Omit<T, Key> {
  for (const key of keys) {
    delete field[key];
  }
  return field;
}

export const REDIS_KEYS = {
  FORGOT_PASSWORD_TOKEN: 'FORGOT_PASSWORD_TOKEN',
  VERIFY_EMAIL_TOKEN: 'VERIFY_EMAIL_TOKEN',
};

/**
 * @param minutes
 * @returns { code: string; expiryMin: number}
 */
export const generateExpiryCode = (minutes = 30) => ({
  code: Math.floor(1000 + Math.random() * 9000).toString(),
  expiryMin: minutes * 60 * 1000,
});

export function createResponse<T>(response: {
  success: boolean;
  message: string;
  data?: T;
}) {
  return response;
}

export function generateFilename(contentType: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = this.getExtensionFromMimeType(contentType);

  return `uploads/${timestamp}-${randomString}.${extension}`;
}

export function getExtensionFromMimeType(mimeType: string): string {
  const extensions: { [key: string]: string } = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'docx',
    'text/plain': 'txt',
  };

  return extensions[mimeType] || 'bin';
}

export function isValidContentType(contentType: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  return allowedTypes.includes(contentType);
}
