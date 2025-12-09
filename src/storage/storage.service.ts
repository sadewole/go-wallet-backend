import { BadRequestException, Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import { generateFilename, isValidContentType } from '@/core/utils/helpers';
import enviroments from '@/core/utils/enviroments';

export interface PresignedUrlResponse {
  url: string;
  fields?: Record<string, string>;
  method: 'PUT';
  publicUrl: string;
  filename: string;
  expiresAt: Date;
}

@Injectable()
export class StorageService {
  private storage: Storage;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const projectId = this.configService.get(enviroments.GCP.PROJECT_ID);
    const clientEmail = this.configService.get(enviroments.GCP.CLIENT_EMAIL);
    const privateKey = this.configService.get(enviroments.GCP.PRIVATE_KEY);

    if (clientEmail && privateKey) {
      this.storage = new Storage({
        projectId,
        credentials: {
          client_email: clientEmail,
          private_key: privateKey.replace(/\\n/g, '\n'),
        },
      });
    } else {
      this.storage = new Storage({ projectId });
    }

    this.bucketName = this.configService.get(enviroments.GCP.BUCKET_NAME);
  }

  async getSignedUrl(filePath: string, expiresInMinutes = 15): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(filePath);

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });

    return signedUrl;
  }

  async generatePresignedUrl(
    filename: string,
    contentType: string,
    expiresInMinutes: number = 15,
  ): Promise<PresignedUrlResponse> {
    if (!isValidContentType(contentType)) {
      throw new BadRequestException('Invalid file content type');
    }

    filename = filename || generateFilename(contentType);

    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(filename);

    const expires = Date.now() + expiresInMinutes * 60 * 1000;

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires,
      contentType,
    });

    return {
      url,
      method: 'PUT',
      publicUrl: `https://storage.googleapis.com/${this.bucketName}/${filename}`,
      filename,
      expiresAt: new Date(expires),
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucketName);
    await bucket.file(filePath).delete();
  }

  async fileExists(filename: string): Promise<boolean> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(filename);

    const [exists] = await file.exists();
    return exists;
  }
}
