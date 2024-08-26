import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { I18nService } from 'nestjs-i18n';

import { UtilityService } from 'common/utils/utils.service';
import { MyLogger } from '../my-logger.service';

import { Country } from 'common/schemas/country.schema';
import { City } from 'common/schemas/city.schema';
import { Language } from 'common/schemas/language.schema';
import { Expertise } from 'common/schemas/expertise.schema';
import { Currency } from 'common/schemas/currency.schema';
import { Prefecture } from 'common/schemas/prefecture.schema';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectModel(Country.name) private countryModel: Model<Country>,
    @InjectModel(City.name) private readonly cityModel: Model<City>,
    @InjectModel(Expertise.name)
    private readonly expertiseModel: Model<Expertise>,
    @InjectModel(Language.name) private readonly languageModel: Model<Language>,
    @InjectModel(Currency.name) private readonly currencyModel: Model<Currency>,
    @InjectModel(Prefecture.name)
    private readonly prefectureModel: Model<Prefecture>,
    private readonly i18n: I18nService,
    private readonly utils: UtilityService,
    private readonly logger: MyLogger,
  ) {}

  async getCountryList(language: string): Promise<object> {
    try {
      const getCountry = await this.countryModel.aggregate([
        { $match: { isActive: true } },
        { $sort: { 'name.en': 1 } },
        {
          $project: {
            _id: 1,
            name: `$name.${language}`,
            code: '$isoCode',
            flag: '$flag',
            dialCode: '$dialCode',
          },
        },
      ]);
      this.logger.log(
        `/resources/country/=====> Result : ${
          getCountry && getCountry.length
        } Countries Found ! `,
      );

      if (!getCountry)
        return {
          success: true,
          info: {
            country: [],
          },
          message: this.i18n.t('lang.NO_RECORD_FOUND', { lang: language }),
        };

      return {
        success: true,
        info: {
          country: getCountry,
        },
        message: this.i18n.t('lang.COUNTRY_LIST', { lang: language }),
      };
    } catch (error) {
      this.logger.log(`/resources/country/=====> Catch S Error : `, error);
      return {
        success: false,
        info: {
          country: [],
        },
        message: error.message,
      };
    }
  }

  async getCityListForCountryId(
    language: string,
    countryId: string,
  ): Promise<object> {
    try {
      this.logger.log(
        `/resources/cities/:countryId =====> countryId : ${countryId} ,language : ${language}`,
      );
      if (!countryId)
        return {
          success: true,
          info: {
            city: [],
          },
          message: this.i18n.t('lang.NO_RECORD_FOUND', { lang: language }),
        };

      const getCity = await this.cityModel.aggregate([
        { $match: { countryId: new mongoose.Types.ObjectId(countryId), isActive: true } },
        { $sort: { 'name.en': 1 } },
        {
          $project: {
            _id: 1,
            name: `$name.${language}`,
            countryId: 1
          }
        }
      ])
      this.logger.log(
        `/resources/cities/:countryId/=====> Result : ${
          getCity && getCity.length
        } Cities Found ! `,
      );

      if (!getCity)
        return {
          success: true,
          info: {
            city: [],
          },
          message: this.i18n.t('lang.NO_RECORD_FOUND', { lang: language }),
        };

      return {
        success: true,
        info: {
          city: getCity,
        },
        message: this.i18n.t('lang.CITY_LIST', { lang: language }),
      };
    } catch (error) {
      this.logger.error(
        '/resources/cities/:countryId =====> catch error : ',
        error,
      );
      return {
        success: false,
        info: {
          city: [],
        },
        message: error.message,
      };
    }
  }

  async getExpertiseList(language: string): Promise<object> {
    try {
      const getExpertise = await this.expertiseModel.aggregate([
        { $match: { isActive: true, 'name.en': { $ne: null } } },
        { $sort: { 'name.en': 1 } },
        {
          $project: {
            _id: 1,
            name: `$name.${language}`,
          }
        }
      ])
      this.logger.log(
        `/resources/expertise/=====> Result : ${
          getExpertise && getExpertise.length
        } Expertise Found ! `,
      );
      if (!getExpertise)
        return {
          success: true,
          info: {
            expertise: [],
          },
          message: this.i18n.t('lang.NO_RECORD_FOUND', { lang: language }),
        };

      return {
        success: true,
        info: {
          expertise: getExpertise,
        },
        message: this.i18n.t('lang.EXPERTISE_LIST', { lang: language }),
      };
    } catch (error) {
      this.logger.error('/resources/expertise/ =====> catch error : ', error);
      return {
        success: false,
        info: {
          expertise: [],
        },
        message: error.message,
      };
    }
  }

  async getLanguageList(language: string): Promise<object> {
    try {
      const getLanguage = await this.languageModel.aggregate([
        { $match: { isActive: true } },
        { $sort: { 'name.en': 1 } },
        {
          $project: {
            _id: 1,
            name: `$name.${language}`,
          }
        }
      ])
      this.logger.log(
        `/resources/language/=====> Result : ${
          getLanguage && getLanguage.length
        } Language Found ! `,
      );

      if (!getLanguage)
        return {
          success: true,
          info: {
            language: [],
          },
          message: this.i18n.t('lang.NO_RECORD_FOUND', { lang: language }),
        };

      return {
        success: true,
        info: {
          language: getLanguage,
        },
        message: this.i18n.t('lang.LANGUAGE_LIST', { lang: language }),
      };
    } catch (error) {
      this.logger.log('/resources/language/ =====> catch error : ', error);
      return {
        success: false,
        info: {
          language: [],
        },
        message: error.message,
      };
    }
  }

  async getCurrencyList(language: string): Promise<object> {
    try {
      const getCurrency = await this.currencyModel.find({ isActive: true });

      this.logger.log(
        `/resources/currency/=====> Result : ${
          getCurrency && getCurrency.length
        } Currency Found ! `,
      );

      if (!getCurrency)
        return {
          success: true,
          info: {
            currency: [],
          },
          message: this.i18n.t('lang.NO_RECORD_FOUND', { lang: language }),
        };

      const data = getCurrency.map((curr) => ({
        _id: curr._id,
        name: curr.name,
        baseCurrency: curr.baseCurrency,
        symbol: curr.symbol,
      }));

      return {
        success: true,
        info: {
          currency: data,
        },
        message: this.i18n.t('lang.CURRENCY_LIST', { lang: language }),
      };
    } catch (error) {
      this.logger.error('/resources/currency/ =====> catch error : ', error);
      return {
        success: false,
        info: {
          currency: [],
        },
        message: error.message,
      };
    }
  }

  async getPrefectureList(language: string): Promise<object> {
    try {
        const getPrefecture = await this.prefectureModel.aggregate([
          { $match: { isActive: true } },
          { $sort: { 'name.en': 1 } },
          {
            $project: {
              _id: 1,
              name: `$name.${language}`,
            }
          }
        ])
      this.logger.log(
        `/resources/prefecture/=====> Result : ${
          getPrefecture && getPrefecture.length
        } Prefecture Found ! `,
      );

      if (!getPrefecture)
        return {
          success: true,
          info: {
            prefecture: [],
          },
          message: this.i18n.t('lang.NO_RECORD_FOUND', { lang: language }),
        };

      return {
        success: true,
        info: {
          prefecture: getPrefecture,
        },
        message: '',
      };
    } catch (error) {
      this.logger.error('/resources/prefecture/ =====> catch error : ', error);
      return {
        success: false,
        info: {
          prefecture: [],
        },
        message: error.message,
      };
    }
  }
}
