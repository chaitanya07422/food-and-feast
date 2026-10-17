import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu-item.dto';
import { MenuService } from './menu.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminMenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('dashboard')
  dashboard() {
    return this.menuService.dashboardStats();
  }

  @Get('menu/categories')
  listCategories() {
    return this.menuService.adminListCategories();
  }

  @Post('menu/categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.menuService.createCategory(dto);
  }

  @Patch('menu/categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.menuService.updateCategory(id, dto);
  }

  @Delete('menu/categories/:id')
  deleteCategory(
    @Param('id') id: string,
    @Query('reassignTo') reassignTo?: string,
  ) {
    return this.menuService.deleteCategory(id, reassignTo);
  }

  @Get('menu/items')
  listItems(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('available') available?: string,
  ) {
    return this.menuService.adminListItems({
      search,
      categoryId,
      status,
      available,
    });
  }

  @Post('menu/items')
  createItem(@Body() dto: CreateMenuItemDto) {
    return this.menuService.createItem(dto);
  }

  @Get('menu/items/:id')
  getItem(@Param('id') id: string) {
    return this.menuService.adminGetItem(id);
  }

  @Patch('menu/items/:id')
  updateItem(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuService.updateItem(id, dto);
  }

  @Delete('menu/items/:id')
  deleteItem(@Param('id') id: string) {
    return this.menuService.deleteItem(id);
  }
}
