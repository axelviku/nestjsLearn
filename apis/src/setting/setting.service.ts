import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model, Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { User } from 'common/schemas/user.schema';
import { MyLogger } from '../my-logger.service';
import { EmailService } from 'common/email/email.service';
import { FeedbackInquiry } from 'common/schemas/feedbackInquiry.schema';
import { Coverage } from 'common/schemas/coverage.schema';

@Injectable()
export class SettingService {
  constructor(
    private readonly i18n: I18nService,
    private readonly logger: MyLogger,
    private readonly emailService: EmailService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Coverage.name) private coverageModel: Model<Coverage>,
    @InjectModel(FeedbackInquiry.name)
    private feedbackInquiryModel: Model<FeedbackInquiry>,
  ) {}

  async userDevicePermission(
    userId: string,
    permissionData: any,
    appLanguage: string,
  ): Promise<object> {
    try {
      this.logger.log(
        `setting/updateUserDevicePermission/=====> userDevicePermission ===>  `,
      );
      const devicePermission = await this.userModel.findOneAndUpdate(
        { _id: userId },
        { $set: { devicePermissions: permissionData } },
        { new: true },
      );
      if (devicePermission) {
        return {
          success: true,
          info: {},
          message: this.i18n.t('lang.DEVICE_PERMISSIONS', {
            lang: appLanguage,
          }),
        };
      } else {
        return {
          success: true,
          info: {},
          message: this.i18n.t('lang.DEVICE_PERMISSIONS_NOT_SAVED', {
            lang: appLanguage,
          }),
        };
      }
    } catch (error) {
      this.logger.log(
        `setting/updateUserDevicePermission/=====> userDevicePermission ===> error `,
        error,
      );
      return {
        success: false,
        info: {},
        message: '',
      };
    }
  }

  async getDevicePermission(
    userId: string,
    appLanguage: string,
  ): Promise<object> {
    try {
      this.logger.log(
        `setting/updateUserDevicePermission/=====> getDevicePermission ===>`,
      );
      const getPermission = await this.userModel.findOne({
        _id: new mongoose.Types.ObjectId(userId),
      });
      if (getPermission) {
        return {
          success: true,
          info: { getPermission: getPermission.devicePermissions },
          message: this.i18n.t('lang.DEVICE_PERMISSIONS_FETCHED', {
            lang: appLanguage,
          }),
        };
      } else {
        return {
          success: false,
          info: { getPermission: {} },
          message: this.i18n.t('lang.DEVICE_PERMISSIONS_FETCHED', {
            lang: appLanguage,
          }),
        };
      }
    } catch (error) {
      this.logger.error(
        `setting/updateUserDevicePermission/=====> getDevicePermission ===> error `,
        error,
      );
      return {
        success: false,
        info: { getPermission: {} },
        message: '',
      };
    }
  }

  async preferedCurrency(
    userId: string,
    currency: string,
    applanguage: string,
  ) {
    try {
      const userCurrency = await this.userModel.findOneAndUpdate(
        { _id: userId },
        { $set: { 'personalInfo.preferredCurrency': currency } },
        { new: true },
      );
      if (userCurrency) {
        return {
          success: true,
          info: {},
          message: this.i18n.t('lang.CURRENCY_UPDATE', {
            lang: applanguage,
          }),
        };
      } else {
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.ERROR_CURRENCY_UPDATE', {
            lang: applanguage,
          }),
        };
      }
    } catch (error) {
      return {
        success: false,
        info: {},
        message: '',
      };
    }
  }

  async inquiryReport(
    data: { _id: string; email: string; fullName: string },
    deviceInfo: any,
    message: string,
    appLanguage: string,
  ): Promise<object> {
    try {
      this.logger.log(`setting/inquiryReport/=====>`);
      const saveJson = {
        from: data.email,
        fullName: data.fullName,
        to: process.env.FROM_MAIL,
        userId: new mongoose.Types.ObjectId(data._id),
        comment: message,
        deviceInfo: {
          os: deviceInfo.os,
          appVersion: deviceInfo.version,
          deviceVersion: deviceInfo.device_version,
          language: deviceInfo.language,
        },
      };
      const saveData = await this.feedbackInquiryModel.create(saveJson);
      if (saveData) {
        await this.emailService.sendEmailMailTemplate(
          'feedback-bug-report',
          data,
          deviceInfo,
          message,
          appLanguage,
        );
        return {
          success: true,
          info: {},
          message: this.i18n.t('lang.BUG_REPORT', {
            lang: appLanguage,
          }),
        };
      } else {
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.ERROR_BUG_REPORT', {
            lang: appLanguage,
          }),
        };
      }
    } catch (error) {
      this.logger.error(`setting/inquiryReport/=====>`, error);
      return {
        success: false,
        info: {},
        message: error.message,
      };
    }
  }

  async languageCoverage(
    languageCoverageData: { languageFrom: string; languageTo: string },
    appLanguage: string,
  ): Promise<object> {
    try {
      this.logger.log(`/setting/languageCoverage=====>`);
      let query: any = {
        coverage: {
          $gt: 0,
        },
      };

      if (
        languageCoverageData.languageFrom != undefined &&
        languageCoverageData.languageFrom != ''
      ) {
        query.languages = new mongoose.Types.ObjectId(
          languageCoverageData.languageFrom,
        );
      }
      if (
        languageCoverageData.languageTo != undefined &&
        languageCoverageData.languageTo != ''
      ) {
        query.languages = new mongoose.Types.ObjectId(
          languageCoverageData.languageTo,
        );
      }
      if (
        languageCoverageData.languageFrom != undefined &&
        languageCoverageData.languageFrom != '' &&
        languageCoverageData.languageTo != undefined &&
        languageCoverageData.languageTo != ''
      ) {
        query = {
          $and: [
            {
              languages: new mongoose.Types.ObjectId(
                languageCoverageData.languageTo,
              ),
            },
            {
              languages: new mongoose.Types.ObjectId(
                languageCoverageData.languageFrom,
              ),
            },
          ],
        };
      }

      const coverage = await this.coverageModel
        .find(query)
        .select({
          languages: 1,
          coverage: 1,
          _id: 0,
        })
        .sort({ coverage: -1 })
        .populate('languages')
        .exec();

      if (!coverage || coverage.length === 0) {
        return {
          success: false,
          info: { coverageArr: [] },
          message: this.i18n.t('lang.NO_RECORD_FOUND', {
            lang: appLanguage,
          }),
        };
      }

      let coverageArr = [];

      await Promise.all(
        coverage.map(async (item) => {
          let local: any = {};
          local = item.toObject();
          let languagesNew = local.languages.map((lang: any) => {
            return {
              _id: lang._id,
              name: lang.name[appLanguage],
              interpreter: lang.coverage,
            };
          });

          local.languages = languagesNew;
          coverageArr.push(local);
        }),
      );
      return {
        success: true,
        info: {
          coverageArr,
        },
        message: this.i18n.t('lang.RECORD_FETCH_SUCCESFULLY', {
          lang: appLanguage,
        }),
      };
    } catch (error) {
      this.logger.error(`/setting/languageCoverage=====>`, error);
      return {
        success: false,
        info: { coverageArr: [] },
        message: error.message,
      };
    }
  }
}
