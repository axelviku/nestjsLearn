import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { CountrySchema } from 'common/schemas/country.schema';
import { CitySchema } from 'common/schemas/city.schema';
import { UserSchema } from 'common/schemas/user.schema';
import { ResponseService } from 'common/services/response.service';
import { AppService } from '../app.service';
import { UtilityService } from 'common/utils/utils.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Country', schema: CountrySchema },
      { name: 'City', schema: CitySchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [ResourcesController],
  providers: [ResourcesService, ResponseService, AppService,UtilityService]
})
export class ResourcesModule {}
