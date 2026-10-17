import { Controller, Get, Param, Query } from '@nestjs/common';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('categories')
  listCategories() {
    return this.menuService.listPublicCategories();
  }

  @Get('items')
  listItems(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('foodType') foodType?: string,
  ) {
    return this.menuService.listPublicItems({ category, search, foodType });
  }

  @Get('items/:slug')
  getItem(@Param('slug') slug: string) {
    return this.menuService.getPublicItemBySlug(slug);
  }
}
