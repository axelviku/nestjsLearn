import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ResponseService } from 'common/services/response.service';
import { CountrySchema } from 'common/schemas/country.schema';
import { CitySchema } from 'common/schemas/city.schema';
import { AppService } from '../app.service';

import { UtilityService } from 'common/utils/utils.service';
import { S3Service } from 'common/utils/s3.service';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Country', schema: CountrySchema },
      { name: 'City', schema: CitySchema },
    ]),
  ],
  controllers: [
    UserController
  ],
  providers: [
    AppService,
    UserService,
    ResponseService,
    UtilityService,
    S3Service
  ],
})
export class UserModule {}