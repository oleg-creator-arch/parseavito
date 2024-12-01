import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<void> {
    await this.appService.scraper();
    await this.appService.sendMessageBot();
    await this.appService.checkProduct();
    setInterval(async ()=>{
      await this.appService.scraper();
      await this.appService.sendMessageBot();
      await this.appService.checkProduct();
    }, 300000);
  }
}
