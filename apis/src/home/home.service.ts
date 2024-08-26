import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model, Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { Setting } from 'common/schemas/setting.schema';
import { User } from 'common/schemas/user.schema';
import { MyLogger } from '../my-logger.service';
import { CurrencyService } from 'common/utils/currency.services';
import { UtilityService } from 'common/utils/utils.service';

@Injectable()
export class HomeService {
  constructor(
    private readonly i18n: I18nService,
    private readonly logger: MyLogger,
    private readonly currencyService: CurrencyService,
    private readonly util: UtilityService,
    @InjectModel(Setting.name) private settingModel: Model<Setting>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getUserListAndAboutOyraaData(appLanguage: string) {
    try {
      const settingData: any = await this.settingModel.findOne({});
      let data = [];
      for (let index = 0; index < settingData.aboutOyraaData.length; index++) {
        const element = {
          section: settingData.aboutOyraaData[index].section[appLanguage],
          headerTitle:
            settingData.aboutOyraaData[index].headerTitle[appLanguage],
          title: settingData.aboutOyraaData[index].title[appLanguage],
          body: settingData.aboutOyraaData[index].body[appLanguage],
          imageLinks: settingData.aboutOyraaData[index].imageLinks,
        };
        data.push(element);
      }
      this.logger.log(
        `/auth/getUserListAndAboutOyraaData/=====> AboutOyraaData ===> success case`,
      );
      return {
        success: true,
        info: {
          aboutOyraaData: data,
          loadMore: data.length > 1 ? true : false,
        },
        message: '',
      };
    } catch (error) {
      this.logger.log(
        `/auth/getUserListAndAboutOyraaData/=====> AboutOyraaData ===> error`,
        error,
      );
      return {
        success: false,
        info: {
          loadMore: false,
        },
        message: '',
      };
    }
  }

  async getRecentUser(appLanguage: string, recUser: any, allQueryParams: any, personalInfo:any) {
    try {
      this.logger.log(
        `/auth/getUserListAndAboutOyraaData/=====> getRecentUser ===> `,
      );
      let recentId = [];
      for (let index = 0; index < recUser.length; index++) {
        const element = recUser[index].userId;
        recentId.push(element);
      }

      const limit = parseInt(process.env.RECENT_USER_LIMIT) || 10;
      const page = allQueryParams.page ? allQueryParams.page : 1;
      const skip = (page - 1) * limit;
      const queryObj = {
        _id: { $in: recentId },
        'status.isActive': true,
      };

      const users = await this.userModel
        .find(queryObj)
        .select('_id fullName personalInfo status roleId interpreterInfo')
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'personalInfo.countryId',
          select: 'name',
        })
        .populate({
          path: 'personalInfo.cityId',
          select: 'name',
        })
        .populate({
          path: 'interpreterInfo.expertiseList',
          select: 'name',
        })
        .populate({
          path: 'roleId',
          select: 'name slug',
        })
        .populate({ path: 'interpreterInfo.interpreterRates.languages' })
        .exec();

      if (users && users.length > 0) {
        const recentUserData = await Promise.all(
          users.map(async (user) => {
            const userDetails: any = user.toObject();
            let userData = {
              _id: userDetails._id,
              fullName: userDetails.fullName,
              roleId: userDetails.roleId,
              gender: userDetails.personalInfo.gender,
              photo: `${
                process.env.AWS_S3_BASE + userDetails.personalInfo.photo
              }`,
              isOnline: userDetails.status.isOnline,
              isLogin: userDetails.status.isLogin,
              responseRate: userDetails.interpreterInfo.responseRate,
              averageRating:
                userDetails.interpreterInfo.ratingDetails.avgRating,
              totalRating:
                userDetails.interpreterInfo.ratingDetails.totalRating,
              countryId:
                userDetails.personalInfo && userDetails.personalInfo.countryId
                  ? await this.util.dataMapperObject(
                      userDetails.personalInfo.countryId,
                      appLanguage,
                    )
                  : {},
              cityId:
                userDetails.personalInfo && userDetails.personalInfo.cityId
                  ? await this.util.dataMapperObject(
                      userDetails.personalInfo.cityId,
                      appLanguage,
                    )
                  : {},
              expertise:
                userDetails.interpreterInfo &&
                userDetails.interpreterInfo.expertiseList
                  ? await this.util.dataMapperArray(
                      userDetails.interpreterInfo.expertiseList,
                      appLanguage,
                    )
                  : [],
              rates: [],
            };
            if (userDetails.interpreterInfo.interpreterRates) {
              userData.rates = userDetails.interpreterInfo.interpreterRates.map(
                (obj) => {
                  const currencyRates = (global as any).currencyRates;
                  const preferedCurr = personalInfo.preferredCurrency;
                  return {
                    _id: obj._id,
                    currency: preferedCurr,
                    fee: this.currencyService.roundCurrency(
                      preferedCurr,
                      obj.fee * currencyRates[obj.currency][preferedCurr],
                    ),
                    languages: [
                      {
                        _id: obj.languages[0]._id,
                        name: obj.languages[0].name[appLanguage],
                      },
                      {
                        _id: obj.languages[1]._id,
                        name: obj.languages[1].name[appLanguage],
                      },
                    ],
                  };
                },
              );
            }
            return userData;
          }),
        );
        this.logger.log(
          `/auth/getUserListAndAboutOyraaData/=====> getRecentUser ===> send `,
        );
        return {
          success: true,
          info: {
            recentUserData,
            // maxLimit: parseInt(process.env.RECENT_USER_LIMIT),
            // currentPage: parseInt(page),
            // displayedRecord: recentUserData.length ? recentUserData.length : 0 ,
          },
          message: this.i18n.t('lang.FAV_LIST', { lang: appLanguage }),
        };
      }
    } catch (error) {
      this.logger.log(
        `/auth/getUserListAndAboutOyraaData/=====> getRecentUser ===> error `,
        error,
      );
      return {
        success: false,
        info: {
          recentUserData: [],
          maxLimit: parseInt(process.env.RECENT_USER_LIMIT),
          currentPage: 1,
          displayedRecord: 1,
        },
        message: '',
      };
    }
  }

  async interpreterData(appLanguage: string, _id: string) {
    try {
      this.logger.log(
        `/auth/getUserListAndAboutOyraaData/=====> interpreterData ===> `,
      );
      const users = await this.userModel
        .findOne({ _id: new mongoose.Types.ObjectId(_id) })
        .select('_id fullName personalInfo status roleId interpreterInfo')
        .populate({
          path: 'personalInfo.countryId',
          select: 'name',
        })
        .populate({
          path: 'personalInfo.cityId',
          select: 'name',
        })
        .populate({
          path: 'roleId',
          select: 'name slug',
        })
        .populate('nativeLanguages')
        .populate('interpreterInfo.interpretationLanguages')
        // .populate({ path: 'interpreterInfo.interpreterRates.languages' })
        .exec();

      if (users) {
        const userDetails: any = users.toObject();
        let userData = {
          _id: userDetails._id,
          fullName: userDetails.fullName,
          roleId: userDetails.roleId,
          gender: userDetails.personalInfo.gender,
          photo:
            userDetails.personalInfo && userDetails.personalInfo.photo
              ? `${process.env.AWS_S3_BASE + userDetails.personalInfo.photo}`
              : '',
          isOnline: userDetails.status.isOnline,
          responseRate:
            userDetails &&
            userDetails.interpreterInfo &&
            userDetails.interpreterInfo
              ? userDetails.interpreterInfo.responseRate
              : 0,
          averageRating:
            userDetails &&
            userDetails.interpreterInfo &&
            userDetails.interpreterInfo
              ? userDetails.interpreterInfo.ratingDetails.avgRating
              : 0,
          totalRating:
            userDetails &&
            userDetails.interpreterInfo &&
            userDetails.interpreterInfo
              ? userDetails.interpreterInfo.ratingDetails.totalRating
              : 0,
          countryId:
            userDetails.personalInfo && userDetails.personalInfo.countryId
              ? await this.util.dataMapperObject(
                  userDetails.personalInfo.countryId,
                  appLanguage,
                )
              : {},
          cityId:
            userDetails.personalInfo && userDetails.personalInfo.cityId
              ? await this.util.dataMapperObject(
                  userDetails.personalInfo.cityId,
                  appLanguage,
                )
              : {},
          language: [],
          metaData: {},
        };

        if (
          userDetails &&
          userDetails.interpreterInfo &&
          userDetails.interpreterInfo &&
          userDetails.interpreterInfo.interpreterRates
        ) {
          const languages = [
            ...userDetails?.interpreterInfo?.interpretationLanguages,
            ...userDetails?.nativeLanguages,
          ];
          userData.language = await this.util.dataMapperArray(
            languages,
            appLanguage,
          );
        }
        const settingData: any = await this.settingModel.findOne({});
        userData.metaData = {
          onlineStatusText: settingData.metaData.onlineStatusText[appLanguage],
          responseRateText: settingData.metaData.responseRateText[
            appLanguage
          ].replace(
            '[percentage]',
            userDetails.interpreterInfo.responseRate + '%',
          ),
        };

        const jobListing = {
          jobListing: [
            {
              clientId: '59a3c559891d70748ead0e74',
              fullName: 'Tamayo Sogo',
              photo:
                'https://s3-us-west-2.amazonaws.com/oyraamedia/users/1721821829-JfXGCVETu3.jpeg',
              date: '2024-08-05T05:33:24.418+00:00',
              startTime: '2024-08-05T05:33:24.418+00:00',
              endTime: '2024-08-05T05:45:24.418+00:00',
              subject:
                'Interpretation for online meetings with external business partners View chat with client. Interpretation for online meetings with external business partners View chat with client',
              jobId: '59a3c559891d70748ead0e75',
              languages: [
                {
                  _id: '59a3c559891d70748ead0e74',
                  name: 'Japanese',
                },
                {
                  _id: '59a3c559891d70748ead0e75',
                  name: 'French',
                },
              ],
              method: 'face-to-face',
            },
            {
              clientId: '59a3c559891d70748ead0e74',
              fullName: 'Ninon Mufferate',
              photo:
                'https://s3-us-west-2.amazonaws.com/oyraamedia/users/1721821829-JfXGCVETu3.jpeg',
              date: '2024-08-04T05:33:24.418+00:00',
              startTime: '2024-08-04T05:33:24.418+00:00',
              endTime: '2024-08-04T05:45:24.418+00:00',
              subject:
                "Hello Ninon, I hope you're doing well. I need an interpreter for an event on 25 August from 10.00 AM to 12.00 AM. The event involves some major technalisty, and the languages needed are Japanese to English. Are you available? If so, can you send me your rates? Thanks ",
              jobId: '59a3c559891d70748ead0e75',
              languages: [
                {
                  _id: '59a3c559891d70748ead0e74',
                  name: 'Japanese',
                },
                {
                  _id: '59a3c559891d70748ead0e75',
                  name: 'English',
                },
              ],
              method: 'Use external tool (ex: Zoom conference)',
            },
          ],
        };

        const cashoutHistory = {
          cashoutData: {
            remainingBalance: '45677',
            remainingBalanceCurrency: 'JPY',
            date: '2024-08-04T05:33:24.418+00:00',
            earningHistory: [
              {
                earningId: '59a3c559891d70748ead0e74',
                price: '1500',
                currency: 'JPY',
                date: '2024-08-04T05:33:24.418+00:00',
                startTime: '2024-08-04T05:33:24.418+00:00',
                endTime: '2024-08-04T05:45:24.418+00:00',
              },
              {
                earningId: '59a3c559891d70748ead0e72',
                price: '8000',
                currency: 'JPY',
                date: '2024-08-12T05:33:24.418+00:00',
                startTime: '2024-08-12T05:33:24.418+00:00',
                endTime: '2024-08-12T05:45:24.418+00:00',
              },
            ],
            metaData: {
              cashOutText:
                'If the Cash Out request amount is less than 5,000 JPY, a transfer fee of 200 JPY will be charged.',
            },
          },
        };
        return {
          success: true,
          info: {
            userData,
            jobListing,
            cashoutHistory,
          },
          message: '',
        };
      }

      this.logger.log(
        `/auth/getUserListAndAboutOyraaData/=====> interpreterData ===> send `,
      );
    } catch (error) {
      this.logger.log(
        `/auth/getUserListAndAboutOyraaData/=====> interpreterData ===> error `,
        error,
      );

      return {
        success: false,
        info: {
          userData: {},
          jobListing: {},
          cashoutHistory: {},
        },
        message: '',
      };
    }
  }
}
