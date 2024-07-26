import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Country } from 'common/schemas/country.schema';
import { City } from 'common/schemas/city.schema';
import * as mongoose from 'mongoose';
import { Model, Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { UtilityService } from 'common/utils/utils.service';

interface MatchQuery {
  isSuspended?: boolean;
  isDeleted?: boolean;
  isReviewed?: boolean;
  userType?: string;
  stripeAccountId?: any;
  city?: any;
  country?: any;
  nationality?: any;
  interestIds?: any;
  experienceIds?: any;
  stripeAdded?: boolean;
  yearOfExperience?: any;
  $or?: { [key: string]: RegExp }[];
}
@Injectable()
export class UserService {
  constructor(
    @InjectModel(Country.name) private countryModel: Model<Country>,
    @InjectModel(City.name) private readonly cityModel: Model<City>,
    private readonly i18n: I18nService,
    private readonly utilityService: UtilityService,
  ) {}
}
