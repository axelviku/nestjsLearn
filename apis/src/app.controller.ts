import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {

    // await this.appService.create({
    //   firstName: "string1",
    //   lastName: "string2",
    //   avatar: "string2"
    // })

    return this.appService.getHello();
  }
}
