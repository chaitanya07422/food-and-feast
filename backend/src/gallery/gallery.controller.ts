import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateGalleryImageDto, UpdateGalleryImageDto } from './dto/gallery.dto';
import { GalleryService } from './gallery.service';

@Controller()
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get('gallery')
  listPublic() {
    return this.galleryService.listPublic();
  }

  @Get('admin/gallery')
  @UseGuards(JwtAuthGuard)
  listAdmin() {
    return this.galleryService.listAdmin();
  }

  @Post('admin/gallery')
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateGalleryImageDto) {
    return this.galleryService.create(dto);
  }

  @Patch('admin/gallery/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateGalleryImageDto) {
    return this.galleryService.update(id, dto);
  }

  @Delete('admin/gallery/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }
}
