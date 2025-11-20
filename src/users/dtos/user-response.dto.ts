import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+1234567890',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Whether user is verified',
    example: false,
  })
  isVerified: boolean;

  @ApiPropertyOptional({
    description: 'Last login timestamp',
    example: '2023-10-01T12:00:00.000Z',
  })
  lastLogin?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-10-01T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-10-01T12:00:00.000Z',
  })
  updatedAt: string;
}
