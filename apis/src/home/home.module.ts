import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { ResponseService } from 'common/services/response.service';
import { AppService } from '../app.service';
import { MyLogger } from '../my-logger.service';
import { UtilityService } from 'common/utils/utils.service';

import { UserSchema } from 'common/schemas/user.schema';
import { SettingSchema } from 'common/schemas/setting.schema';
import { CurrencyService } from 'common/utils/currency.services';
import { CurrencySchema } from 'common/schemas/currency.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Setting', schema: SettingSchema },
      { name: 'Currency', schema: CurrencySchema },
    ]),
  ],
  controllers: [HomeController],
  providers: [
    AppService,
    HomeService,
    ResponseService,
    MyLogger,
    UtilityService,
    CurrencyService,
  ],
})
export class HomeModule {}
