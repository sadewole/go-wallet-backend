export class CreateAdminDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export const getDefaultAdminData = (): CreateAdminDto => {
  const defaultPassword =
    process.env.DEFAULT_ADMIN_PASSWORD ||
    (process.env.NODE_ENV === 'production' ? 'ChangeMe123!' : 'Admin123!');

  return {
    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
    password: defaultPassword,
    firstName: process.env.DEFAULT_ADMIN_FIRST_NAME || 'System',
    lastName: process.env.DEFAULT_ADMIN_LAST_NAME || 'Administrator',
    phoneNumber: process.env.DEFAULT_ADMIN_PHONE || '+1234567890',
  };
};
