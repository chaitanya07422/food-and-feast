import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadsService } from './uploads.service';

@Controller('admin/uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly config: ConfigService,
  ) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    const max =
      this.config.get<number>('maxUploadBytes') ?? 20 * 1024 * 1024;
    if (file.size > max) {
      throw new BadRequestException(
        `Image must be under ${Math.round(max / 1024 / 1024)}MB`,
      );
    }
    return this.uploadsService.saveImage(file);
  }
}
