import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model, Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { MyLogger } from '../my-logger.service';
import { User } from 'common/schemas/user.schema';
import { UtilityService } from 'common/utils/utils.service';
import { CurrencyService } from 'common/utils/currency.services';

@Injectable()
export class FavouriteService {
  constructor(
    private readonly i18n: I18nService,
    private readonly logger: MyLogger,
    private readonly util: UtilityService,
    private readonly currencyService: CurrencyService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async getFavUser(appLanguage: string, favUser: any, allQueryParams: any,userReferralCode:any,personalInfo:any) {
    try {
      this.logger.log(`/favorite/=====> getFavUser ===> `);
      const limit = parseInt(process.env.FAV_USER_LIMIT) || 10;
      const page = allQueryParams.page ? allQueryParams.page : 1;
      const skip = (page - 1) * limit;
      const queryObj = {
        _id: { $in: favUser },
        'status.isActive': true,
      };

  
      const users = await this.userModel
        .find(queryObj)
        .select(
          '_id fullName personalInfo status roleId interpreterInfo nativeLanguages',
        )
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
        .populate('nativeLanguages')
        .populate({ path: 'interpreterInfo.interpretationLanguages' })
        .exec();

      if (users && users.length > 0) {
        const favoriteUserData = await Promise.all(
          users.map(async (user) => {
            const userDetails: any = user.toObject();
            let userData = {
              _id: userDetails._id,
              isProfessional:
              userDetails.status?.isProfessional == 'Verified'
                ? true
                : false,
              isRecommended:
             (userReferralCode?.assignedSpecificInterpreters?.length > 0) ? userReferralCode.assignedSpecificInterpreters.includes(userDetails._id) : false,
              fullName: userDetails.fullName,
              roleId: userDetails.roleId,
              gender: userDetails.personalInfo.gender,
              photo:
                userDetails.personalInfo.photo != ''
                  ? `${
                      process.env.AWS_S3_BASE + userDetails.personalInfo.photo
                    }`
                  : '',
              isOnline: userDetails.status.isOnline,
              isLogin: userDetails.status.isLogin,
              responseRate: userDetails.interpreterInfo
                ? userDetails.interpreterInfo.responseRate
                : 0,
              averageRating: userDetails.interpreterInfo
                ? userDetails.interpreterInfo.ratingDetails.avgRating
                : 0,
              totalRating: userDetails.interpreterInfo
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
              expertiseList:
                userDetails.interpreterInfo &&
                userDetails.interpreterInfo.expertiseList
                  ? await this.util.dataMapperArray(
                      userDetails.interpreterInfo.expertiseList,
                      appLanguage,
                    )
                  : [],
              languages: [],
              rates : []
            };
            const languages = [
              ...userDetails?.interpreterInfo?.interpretationLanguages,
              ...userDetails?.nativeLanguages,
            ];

            userData.languages = await this.util.dataMapperArray(
              languages,
              appLanguage,
            );
            userData.rates =  userDetails.interpreterInfo.interpreterRates.map(
              (obj) => {
                const currencyRates = (global as any).currencyRates;
                const preferedCurr = personalInfo?.preferredCurrency;
                return {
                  currency: preferedCurr,
                  fee: this.currencyService.roundCurrency(
                    preferedCurr,
                    obj.fee * currencyRates[obj.currency][preferedCurr],
                  ),
                  languages: [],
                };
              },
            )
            return userData;
          }),
        );
        // this.logger.log(
        //   `/favorite/=====> getFavUser ===> favoriteUserData :  `,
        //   favoriteUserData,
        // );

        return {
          success: true,
          info: {
            favoriteUserData,
            maxLimit:parseInt(process.env.FAV_USER_LIMIT),
            currentPage: parseInt(page),
            displayedRecord: favoriteUserData.length ? favoriteUserData.length : 0
          },
          message: this.i18n.t('lang.FAV_LIST', { lang: appLanguage }),
        };
      } else {
        return {
          success: true,
          info: {
            favoriteUserData: [],
            // maxLimit:parseInt(process.env.FAV_USER_LIMIT),
            // currentPage: parseInt(page),
            // displayedRecord: 0
          },
          message: this.i18n.t('lang.FAV_LIST', { lang: appLanguage }),
        };
      }
    } catch (error) {
      this.logger.log(`/favorite/=====> getFavUser ===> error `, error);
      return {
        success: false,
        info: {
          favoriteUserData: [],
        },
        message: '',
      };
    }
  }

  async addFavorite(appLanguage: string, userId: string, favUserId: string) {
    try {
      this.logger.log(`/favorite/=====> addFavorite ===> `);
      if (userId.toString() == favUserId.toString()) {
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.FAV_ADDED_YOURSELF_ERR_MSG', {
            lang: appLanguage,
          }),
        };
      }
      const addUser = await this.userModel.updateOne(
        {
          _id: new mongoose.Types.ObjectId(userId),
        },
        {
          $addToSet: {
            favUsers: new mongoose.Types.ObjectId(favUserId),
          },
        },
      );
      if (addUser && addUser.acknowledged == true) {
        return {
          success: true,
          info: {},
          message: this.i18n.t('lang.FAV_ADDED', { lang: appLanguage }),
        };
      } else {
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.ERROR_FAV_ADDED', { lang: appLanguage }),
        };
      }
    } catch (error) {
      this.logger.log(`/favorite/=====> addFavorite ===> error`, error);
      return {
        success: false,
        info: {},
        message: '',
      };
    }
  }

  async removeFavorite(appLanguage: string, userId: string, favUserId: string) {
    try {
      this.logger.log(`/favorite/=====> removeFavorite ===> `);
      const data = await this.userModel.updateOne(
        {
          _id: new mongoose.Types.ObjectId(userId),
        },
        {
          $pull: {
            favUsers: new mongoose.Types.ObjectId(favUserId),
          },
        },
      );

      if (data && data.modifiedCount == 1) {
        return {
          success: true,
          info: {},
          message: this.i18n.t('lang.FAV_DELETED', { lang: appLanguage }),
        };
      } else {
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.ERROR_IN_REMOVE', { lang: appLanguage }),
        };
      }
    } catch (error) {
      this.logger.log(`/favorite/====> removeFavorite ===> `, error);
      return {
        success: false,
        info: {},
        message: '',
      };
    }
  }
}
