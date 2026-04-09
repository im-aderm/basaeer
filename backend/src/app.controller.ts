import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('newsletter/subscribe')
  subscribeToNewsletter(@Body() body: { email: string }) {
    // Mock backend logic for now until DB model is requested
    console.log(`[Newsletter] New subscription: ${body.email}`);
    return { success: true, message: 'Successfully subscribed to newsletter' };
  }
}
