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
import { CreateHeroSlideDto, UpdateHeroSlideDto } from './dto/hero.dto';
import { HeroService } from './hero.service';

@Controller()
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @Get('hero/slides')
  listPublic() {
    return this.heroService.listPublic();
  }

  @Get('admin/hero/slides')
  @UseGuards(JwtAuthGuard)
  listAdmin() {
    return this.heroService.listAdmin();
  }

  @Post('admin/hero/slides')
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateHeroSlideDto) {
    return this.heroService.create(dto);
  }

  @Patch('admin/hero/slides/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateHeroSlideDto) {
    return this.heroService.update(id, dto);
  }

  @Delete('admin/hero/slides/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.heroService.remove(id);
  }
}
