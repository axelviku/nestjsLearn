import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FavouriteService } from './favourite.service';
import { FavouriteController } from './favourite.controller';
import { ResponseService } from 'common/services/response.service';
import { AppService } from '../app.service';
import { MyLogger } from '../my-logger.service';
import { UtilityService } from 'common/utils/utils.service';
import { UserSchema } from 'common/schemas/user.schema';
import { CurrencyService } from 'common/utils/currency.services';
import { CurrencySchema } from 'common/schemas/currency.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Currency', schema: CurrencySchema },
    ]),
  ],
  controllers: [FavouriteController],
  providers: [
    AppService,
    FavouriteService,
    ResponseService,
    MyLogger,
    UtilityService,
    CurrencyService,
  ],
})
export class FavouriteModule {}
