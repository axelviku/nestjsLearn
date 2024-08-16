import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Country } from 'common/schemas/country.schema';
import { City } from 'common/schemas/city.schema';
import * as mongoose from 'mongoose';
import { Model, Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { UtilityService } from 'common/utils/utils.service';
import { User } from 'common/schemas/user.schema';
import { MyLogger } from '../my-logger.service';

@Injectable()
export class InterpreterService {
  constructor(
    private readonly i18n: I18nService,
    private readonly logger: MyLogger,
    private readonly utilService: UtilityService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {} // private readonly utilityService: UtilityService, // private readonly i18n: I18nService, // @InjectModel(City.name) private readonly cityModel: Model<City>, // @InjectModel(Country.name) private countryModel: Model<Country>,

  async editInterpreterRate(userId, lang: string, editInterpretationRatesData) {
    try {
      const savedData: any = await this.userModel
        .findOneAndUpdate(
          { _id: userId },
          {
            'interpreterInfo.interpreterRates':
              editInterpretationRatesData.rates,
          },
          { new: true },
        )
        .populate('interpreterInfo.interpreterRates.languages', '_id name');

      const newates = [];
      const savedRate = savedData?.interpreterInfo?.interpreterRates;
      for (let i = 0; i < savedRate.length; i++) {
        // const languageRate = [];
        const languageRate = await this.utilService.dataMapperArray(
          savedRate[i].languages,
          lang,
        );
        newates.push({
          fee: savedData.interpreterInfo.interpreterRates[i].fee,
          currency: savedData.interpreterInfo.interpreterRates[i].currency,
          language: languageRate[0],
        });
      }

      return newates;
    } catch (error) {
      this.logger.error(`/auth/signUp/=====> catch S error ===> `, error);
      return {
        success: false,
        info: {},
        message: error.message,
      };
    }
  }

  async onlineOfflineInterPreter(
    userId: string,
    status: boolean,
    language: string,
  ) {
    try {
      this.logger.log(`/interpreter/updateOnlineStatus=====>`);
      const updateRecord = await this.userModel.updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { 'status.isOnline': status },
      );
      if (updateRecord.modifiedCount === 1) {
        return {
          success: true,
          info: {},
          message: this.i18n.t('lang.STATUS_UPDATED', { lang: language }),
        };
      } else {
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.STATUS_NOT_UPDATED', { lang: language }),
        };
      }
    } catch (error) {
      this.logger.error(
        `/interpreter/updateOnlineStatus=====> catch S error ===> `,
        error,
      );
      return {
        success: false,
        info: {},
        message: error.message,
      };
    }
  }
}
