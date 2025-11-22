import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GeneratePresignedUrlDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  filename?: string;

  @IsString()
  @ApiProperty()
  contentType: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  expiresIn?: number;
}
