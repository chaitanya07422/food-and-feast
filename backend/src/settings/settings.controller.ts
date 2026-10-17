import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettingsService } from './settings.service';

@Controller()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('restaurant/settings')
  getPublic() {
    return this.settingsService.getPublic();
  }

  @Get('admin/settings')
  @UseGuards(JwtAuthGuard)
  getAdmin() {
    return this.settingsService.getAdmin();
  }

  @Patch('admin/settings')
  @UseGuards(JwtAuthGuard)
  update(@Body() body: Record<string, unknown>) {
    return this.settingsService.update(body as never);
  }
}
