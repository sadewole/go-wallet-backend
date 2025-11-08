import { BaseRepository } from '@/libs/database';
import { DATABASE_CONNECTION, DatabaseSchema } from '@/libs/database/constant';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { CreateUserDto } from './dtos/user.dto';
import { PasswordService } from '@/auth/password.service';

@Injectable()
export class UserRepository extends BaseRepository<'users'> {
  constructor(
    @Inject(DATABASE_CONNECTION)
    database: NeonHttpDatabase<DatabaseSchema>,
    private passwordService: PasswordService,
  ) {
    super(database, 'users');
  }

  async createUser(createUserDto: CreateUserDto) {
    const password = await this.passwordService.hashPassword(
      createUserDto.password,
    );
    const user = await this.findFirst({
      where: (user, { eq }) =>
        eq(user.email, createUserDto.email.toLowerCase()),
    });

    if (user) {
      throw new ConflictException('Email already exists');
    }

    const result = await this.create({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
      password,
    });

    return result;
  }

  async findByEmail(email: string) {
    const user = await this.findFirst({
      where: (user, { eq }) => eq(user.email, email),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
