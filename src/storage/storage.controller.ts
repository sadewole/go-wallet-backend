import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { GeneratePresignedUrlDto } from './dtos/presigned.dto';

@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('presigned-url')
  async generatePresignedUrl(@Body() body: GeneratePresignedUrlDto) {
    try {
      return await this.storageService.generatePresignedUrl(
        body.filename,
        body.contentType,
        body.expiresIn,
      );
    } catch (error) {
      throw new BadRequestException(
        `Failed to generate presigned URL: ${error.message}`,
      );
    }
  }

  @Delete(':filename')
  async deleteFile(@Param('filename') filename: string) {
    try {
      await this.storageService.deleteFile(filename);
      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }
}
