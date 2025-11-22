import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { AdminSeedService } from '@/admin/admin-seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminSeedService = app.get(AdminSeedService);

  try {
    console.log('🚀 Seeding default admin user...');

    await adminSeedService.manuallySeedAdmin();

    console.log('✅ Admin seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Admin seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
