import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GeneratePresignedUrlDto {
  @IsString()
  @IsOptional()
  filename?: string;

  @IsString()
  contentType: string;

  @IsNumber()
  @IsOptional()
  expiresIn?: number;
}
