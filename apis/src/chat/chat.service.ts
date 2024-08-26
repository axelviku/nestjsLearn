import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Country } from 'common/schemas/country.schema';
import { City } from 'common/schemas/city.schema';
import * as mongoose from 'mongoose';
import { Model, Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { UtilityService } from 'common/utils/utils.service';

@Injectable()
export class ChatService {
  constructor() {} // private readonly utilityService: UtilityService, // private readonly i18n: I18nService, // @InjectModel(City.name) private readonly cityModel: Model<City>, // @InjectModel(Country.name) private countryModel: Model<Country>,
}
