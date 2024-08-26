import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ResourcesController } from './resources.controller';

import { ResourcesService } from './resources.service';
import { ResponseService } from 'common/services/response.service';
import { AppService } from '../app.service';
import { UtilityService } from 'common/utils/utils.service';
import { MyLogger } from '../my-logger.service';

import { CountrySchema } from 'common/schemas/country.schema';
import { CitySchema } from 'common/schemas/city.schema';
import { LanguageSchema } from 'common/schemas/language.schema';
import { CurrencySchema } from 'common/schemas/currency.schema';
import { ExpertiseSchema } from 'common/schemas/expertise.schema';
import { PrefectureSchema } from 'common/schemas/prefecture.schema';
import { UserSchema } from 'common/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Country', schema: CountrySchema },
      { name: 'City', schema: CitySchema },
      { name: 'Expertise', schema: ExpertiseSchema },
      { name: 'Language', schema: LanguageSchema },
      { name: 'Currency', schema: CurrencySchema },
      { name: 'Prefecture', schema: PrefectureSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [ResourcesController],
  providers: [
    ResourcesService,
    ResponseService,
    AppService,
    UtilityService,
    MyLogger,
  ],
})
export class ResourcesModule {}
