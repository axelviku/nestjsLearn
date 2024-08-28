import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Country } from 'common/schemas/country.schema';
import { City } from 'common/schemas/city.schema';
import { ReferralCode } from 'common/schemas/referralCode.schema';

import * as mongoose from 'mongoose';
import { Model, Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { UtilityService } from 'common/utils/utils.service';
import { User } from 'common/schemas/user.schema';
import { MyLogger } from '../my-logger.service';
import { CommonService } from 'common/utils/common.services';
import { findInterPreterSortingVariable } from 'common/constant/constant';
import { CurrencyService } from 'common/utils/currency.services';
import { S3Service } from 'common/utils/s3.service';
import { Review } from 'common/schemas/review.schema';

@Injectable()
export class InterpreterService {
  constructor(
    
    private readonly s3Service: S3Service,
    private readonly i18n: I18nService,
    private readonly logger: MyLogger,
    private readonly utilService: UtilityService,
    private readonly commonService: CommonService,
    private readonly currencyService: CurrencyService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(ReferralCode.name) private referralCode: Model<ReferralCode>,
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

  async getInterpreterProfile(
    appLanguage: string,
    interpreterProfileDataDto: any,
    favUsers: any,
    personalInfo:any,
    userReferralCode:any
  ) {
    try {
      const { interpreterId } = interpreterProfileDataDto;
      const interpreterProfileData = await this.userModel
        .findOne({ _id: new mongoose.Types.ObjectId(interpreterId) })
        .select(
          '_id fullName personalInfo status roleId interpreterInfo nativeLanguages',
        )
        .populate({
          path: 'personalInfo.countryId',
          select: 'name',
        })
        .populate({
          path: 'personalInfo.cityId',
          select: 'name',
        })
        .populate('nativeLanguages')
        .populate('interpreterInfo.interpretationLanguages')
        .populate('interpreterInfo.expertiseList')
        .populate('interpreterInfo.interpreterRates.languages')
        .exec();
      if (interpreterProfileData) {
        const userDetails: any = interpreterProfileData.toObject();
        const userData = {
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
          profileDetails:
            userDetails &&
            userDetails.interpreterInfo &&
            userDetails.interpreterInfo
              ? userDetails.interpreterInfo.profileDetails
              : '',
          countryId:
            userDetails.personalInfo && userDetails.personalInfo.countryId
              ? await this.utilService.dataMapperObject(
                  userDetails.personalInfo.countryId,
                  appLanguage,
                )
              : {},
          cityId:
            userDetails.personalInfo && userDetails.personalInfo.cityId
              ? await this.utilService.dataMapperObject(
                  userDetails.personalInfo.cityId,
                  appLanguage,
                )
              : {},
          language: [],
          interpreterRates: [],
          expertise: [],
          academicBackground:
            userDetails.interpreterInfo?.academicBackground || [],
          qualification: userDetails.interpreterInfo?.qualification || [],
          metaData: {},
          isFavorite:
            (favUsers.length > 0) ? favUsers.includes(userDetails._id) : false,
          isRecommended:
            (userReferralCode?.assignedSpecificInterpreters?.length > 0) ? userReferralCode.assignedSpecificInterpreters.includes(userDetails._id) : false,
          isProfessional:
          userDetails.status.isProfessional == 'Verified'
            ? true
            : false,
            bio:userDetails.interpreterInfo.profileDetails
        };

        if (
          userDetails &&
          userDetails.interpreterInfo &&
          userDetails.interpreterInfo &&
          userDetails.interpreterInfo.interpreterRates
        ) {
          const languages = [
            ...userDetails.nativeLanguages.map((lang) => ({
              _id: lang._id,
              name: lang.name?.[appLanguage] || '',
              type: 'native',
            })),
            ...userDetails.interpreterInfo.interpretationLanguages.map(
              (lang) => ({
                _id: lang._id,
                name: lang.name?.[appLanguage] || '',
                type: 'interpretation',
              }),
            ),
          ];

          userData.language = languages;
        }
        if (userDetails.interpreterInfo?.interpreterRates) {

          const currencyRates = (global as any).currencyRates;
          const preferedCurr = personalInfo?.preferredCurrency;
          userData.interpreterRates = await Promise.all(
            userDetails.interpreterInfo.interpreterRates.map(async (rate) => ({
              fee: this.currencyService.roundCurrency(
                preferedCurr,
                rate.fee * currencyRates[rate.currency][preferedCurr],
              ),
              currency: preferedCurr,
              languages: await this.utilService.dataMapperArray(
                rate.languages,
                appLanguage,
              ),
            })),
          );
        }
        if (userDetails.interpreterInfo?.expertiseList) {
          userData.expertise = await this.utilService.dataMapperArray(
            userDetails.interpreterInfo.expertiseList,
            appLanguage,
          );
        }

        // review details
        //{userId:new mongoose.Types.ObjectId(interpreterId)} TODO Girraj
        const review = await this.getAllReview(interpreterId,1,2);
        return {
          success: true,
          info: {
            interpreterProfileData: userData,
            interpreterReviewData: review,
          },
          message: this.i18n.t('lang.DATA_FOUND', { lang: appLanguage }),
        };
      } else {
        this.logger.warn(
          `/interpreter/getInterpreterProfile=====> No record found ! `,
        );
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.USER_NOT_FOUND', { lang: appLanguage }),
        };
      }
    } catch (error) {
      this.logger.error(
        `/interpreter/getInterpreterProfile/=====> catch S error ===> `,
        error,
      );
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
          message: this.i18n.t('lang.ONLINE_STATUS_UPDATED', {
            lang: language,
          }),
        };
      } else {
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.ONLINE_STATUS_NOT_UPDATED', {
            lang: language,
          }),
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

  async findInterpreterListWithSearch(
    data: any,
    lang: string,
    userReferralCode: any,
    personalInfo:any,
    allQueryParams: any,
  ) {
    try {
      this.logger.log(`/interpreter/findInterpreterListWithSearch=====>`);

      const searchKeyword = data?.searchKeyword;
      const expertiseIds = data?.expertiseIds;
      const languageFrom = data?.languageFrom;
      const languageTo = data?.languageTo;
      const countryId = data?.countryId;
      const cityId = data?.cityId;
      const isOnline = data?.isOnline;
      const isProfessionalInterpreter = data?.isProfessionalInterpreter;

      //Pagination Calculater
      const orderRequest = allQueryParams.sortingBy;
      const currentPage = allQueryParams?.page
        ? parseInt(allQueryParams.page)
        : 1;
      const limitRecord = parseInt(process.env.INTERPRETER_USER_LIMIT);
      const startRecord = (currentPage - 1) * limitRecord;
      const endRecord = currentPage * limitRecord;

      let sort_query: any = {
        'status.isOnline': -1,
        'status.isLogin': -1,
        'interpreterInfo.ratingDetails.avgRating': -1,
        'interpreterInfo.ratingDetails.responseRate': -1,
        'callDetails.callReceived': -1,
      };


      if (orderRequest == findInterPreterSortingVariable.INTERPRETER_SCORE) {
        sort_query = {
          ...sort_query,
          'interpreterInfo.ratingDetails.avgRating': -1,
        };
      }

      let query: any = {
        roleId: new mongoose.Types.ObjectId(process.env.INTERPRETER_OBJECT_ID),
        'status.isSelfdelete': false,
        'status.isDeleted': false,
        'status.isActive': true,
        'status.profileStatus': 'Complete',
      };

      if (searchKeyword != undefined && searchKeyword != '') {
        const escaped_keyword = data.searchKeyword.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&',
        );
        query.fullName = {
          $regex: RegExp(escaped_keyword, 'i'),
        };
      }

      if (expertiseIds != undefined && expertiseIds != '') {
        const expertiseIdsArray = await this.utilService.arrayToObject(
          expertiseIds,
        );

        query = {
          ...query,
          'interpreterInfo.expertiseList': { $in: expertiseIdsArray },
        };
      }

      if (countryId != undefined  && countryId !="") {
        query = { ...query, 'personalInfo.countryId': countryId };
      }

      if (cityId != undefined && cityId !="") {
        query = { ...query, 'personalInfo.cityId': cityId };
      }


      if (isOnline != undefined && isOnline !="") {
        query = { ...query, 'status.isOnline': isOnline };
      }

      if (isProfessionalInterpreter!=="" && isProfessionalInterpreter!=undefined && isProfessionalInterpreter==true) {
        query = {
          ...query,
          'status.isProfessional': "Verified",
        };
      }
      if (languageFrom != undefined && languageFrom !="" && languageTo != undefined && languageTo!="") {
        query = {
          ...query,
          'interpreterInfo.interpreterRates': {
            $elemMatch: {
              languages: await this.utilService.arrayToObject([
                languageFrom,
                languageTo,
              ]),
            },
          },
        };

        if (orderRequest == findInterPreterSortingVariable.PRICE_ASC) {
          sort_query = {
            ...sort_query,
            'interpreterInfo.interpreterRates.interpreterInfo.fee': 1,
          };
        }
        if (orderRequest == findInterPreterSortingVariable.PRICE_DSC) {
          sort_query = {
            ...sort_query,
            'interpreterInfo.interpreterRates.interpreterInfo.fee': -1,
          };
        }
      }
      
      let referralInterpreterArr = [];
      let referralInterpreterArrObj = [];
  
      if (userReferralCode) {
        referralInterpreterArr =
          userReferralCode && userReferralCode.assignedSpecificInterpreters
            ? userReferralCode.assignedSpecificInterpreters
            : [];

        if (
          referralInterpreterArr != undefined &&
          referralInterpreterArr.length > 0
        ) {
          referralInterpreterArrObj = referralInterpreterArr.map(function (
            user,
          ) {
            return user.toString();
          });
          query._id = {
            $in: referralInterpreterArrObj,
          };
        }
      }
      const normalUsers = [];
      const recommendedUser = [];

      let totalNormalUser = 0;
      let totalRecommendedUser = 0;
      if (referralInterpreterArrObj.length > 0) {
        totalRecommendedUser = await this.findTotalInterpreterQuery(query);
      }

      
      if (referralInterpreterArrObj.length>0) {

        const recommendedUserData: any = await this.findInterpreterQuery(
          query,
          currentPage,
          sort_query,
        );

        for (let i = 0; i < recommendedUserData.length; i++) {
          const nativeLanguageAndinterpretation = recommendedUserData[
            i
          ].nativeLanguages.concat(
            recommendedUserData[i].interpreterInfo.interpretationLanguages,
          );
          const languages = await this.utilService.dataMapperArray(
            nativeLanguageAndinterpretation,
            lang,
          );
          recommendedUser.push({
            fullName: recommendedUserData[i].fullName,
            isProfessional:
              recommendedUserData[i].status?.isProfessional == 'Verified'
                ? true
                : false,
            _id: recommendedUserData[i]._id,
            roleId: recommendedUserData[i].roleId,
            photo: (recommendedUserData[i].personalInfo.photo) ?  `${
              process.env.AWS_S3_BASE + recommendedUserData[i].personalInfo.photo
            }` : '',
            isOnline: recommendedUserData[i].status.isOnline,
            isLogin: recommendedUserData[i].status.isLogin,
            responseRate: recommendedUserData[i].interpreterInfo.responseRate,
            averageRating: recommendedUserData[i].interpreterInfo.ratingDetails.avgRating,
            isRecommended: true,
            languages: languages,
            expertise: await this.utilService.dataMapperArray(
              recommendedUserData[i].interpreterInfo?.expertiseList,
              lang,
            ),
            gender: recommendedUserData[i].personalInfo.gender,
            totalRating:
            recommendedUserData[i].interpreterInfo.ratingDetails.totalRating,

            countryId:
            recommendedUserData[i].personalInfo &&
            recommendedUserData[i].personalInfo.countryId
                ? await this.utilService.dataMapperObject(
                  recommendedUserData[i].personalInfo.countryId,
                    lang,
                  )
                : {},
  
            cityId:
            recommendedUserData[i].personalInfo &&
            recommendedUserData[i].personalInfo.cityId
                ? await this.utilService.dataMapperObject(
                  recommendedUserData[i].personalInfo.cityId,
                    lang,
                  )
                : {},
            rates: recommendedUserData[i].interpreterInfo.interpreterRates.map(
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
            ),
          });
        }
      }

      if (referralInterpreterArrObj.length) {
        query._id = {
          $nin: referralInterpreterArrObj,
        };
      }
      totalNormalUser = await this.findTotalInterpreterQuery(query);
      const normalUserData = await this.findInterpreterQuery(
        query,
        currentPage,
        sort_query,
      );

      for (let i = 0; i < normalUserData.length; i++) {
        const nativeLanguageAndinterpretation = normalUserData[
          i
        ].nativeLanguages.concat(
          normalUserData[i].interpreterInfo.interpretationLanguages,
        );
        const languages = await this.utilService.dataMapperArray(
          nativeLanguageAndinterpretation,
          lang,
        );
        normalUsers.push({
          fullName: normalUserData[i].fullName,
          isProfessional:
            normalUserData[i].status.isProfessional == 'Verified'
              ? true
              : false,
          _id: normalUserData[i]._id,
          roleId: normalUserData[i].roleId,
          gender: normalUserData[i].personalInfo.gender,
          photo:(normalUserData[i].personalInfo.photo) ?  `${
            process.env.AWS_S3_BASE + normalUserData[i].personalInfo.photo
          }` : '',
          isOnline: normalUserData[i].status.isOnline,
          isLogin: normalUserData[i].status.isLogin,
          responseRate: normalUserData[i].interpreterInfo.responseRate,
          averageRating:
            normalUserData[i].interpreterInfo.ratingDetails.avgRating,
          totalRating:
            normalUserData[i].interpreterInfo.ratingDetails.totalRating,
          isRecommended:false,
          languages: languages,
          expertiseList: await this.utilService.dataMapperArray(
            normalUserData[i].interpreterInfo?.expertiseList,
            lang,
          ),

          countryId:
            normalUserData[i].personalInfo &&
            normalUserData[i].personalInfo.countryId
              ? await this.utilService.dataMapperObject(
                  normalUserData[i].personalInfo.countryId,
                  lang,
                )
              : {},

          cityId:
            normalUserData[i].personalInfo &&
            normalUserData[i].personalInfo.cityId
              ? await this.utilService.dataMapperObject(
                  normalUserData[i].personalInfo.cityId,
                  lang,
                )
              : {},
          rates: normalUserData[i].interpreterInfo.interpreterRates.map(
            (obj) => {
              const currencyRates = (global as any).currencyRates;
              const preferedCurr =   personalInfo?.preferredCurrency;
              return {
                currency: preferedCurr,
                fee: this.currencyService.roundCurrency(
                  preferedCurr,
                  obj.fee * currencyRates[obj.currency][preferedCurr],
                ),
                languages: [],
              };
            },
          ),
        });
      }

      return {
        success: false,
        info: {
          filteredRequest: data,
          sortRequest: allQueryParams.sortingBy,
          maxLimit: parseInt(process.env.INTERPRETER_USER_LIMIT),
          currentPage: parseInt(allQueryParams.page),
          displayedRecord: totalNormalUser + totalRecommendedUser,
          filteredRecords: [...recommendedUser, ...normalUsers],
        },
      };
    } catch (error) {
      this.logger.error(
        `/interpreter/findInterpreterListWithSearch=====> catch S error ===> `,
        error,
      );
      return {
        success: false,
        info: {},
        message: error.message,
      };
    }
  }

  async updateInterpreterProfile(
    appLanguage: string,
    editInterpretationRatesData,
  ) {
    try {
      const { interpreterId, ...updateFields } = editInterpretationRatesData;
      const updateDataObj: any = {
        ...(updateFields.fullName ? { fullName: updateFields.fullName } : {}),
        ...(updateFields.gender
          ? { 'personalInfo.gender': updateFields.gender }
          : {}),
        ...(updateFields.photo
          ? { 'personalInfo.photo': updateFields.photo }
          : {}),
        ...(updateFields.countryId
          ? { 'personalInfo.countryId': updateFields.countryId }
          : {}),
        ...(updateFields.cityId
          ? { 'personalInfo.cityId': updateFields.cityId }
          : {}),
        ...(updateFields.profileDetails
          ? { 'interpreterInfo.profileDetails': updateFields.profileDetails }
          : {}),
        ...(updateFields.academicBackground
          ? {
              'interpreterInfo.academicBackground':
                updateFields.academicBackground,
            }
          : {}),
        ...(updateFields.qualification
          ? { 'interpreterInfo.qualification': updateFields.qualification }
          : {}),
        ...(updateFields.associations
          ? { 'interpreterInfo.associations': updateFields.associations }
          : {}),
        ...(updateFields.nativeLanguages
          ? { nativeLanguages: updateFields.nativeLanguages }
          : {}),
        ...(updateFields.prefectureId
          ? { prefectureId: updateFields.prefectureId }
          : {}),
        ...(updateFields.interpretationLanguages
          ? {
              'interpreterInfo.interpretationLanguages':
                updateFields.interpretationLanguages,
            }
          : {}),
        ...(updateFields.expertiseList
          ? { 'interpreterInfo.expertiseList': updateFields.expertiseList }
          : {}),
      };

      const interpreterProfileData: any = await this.userModel
        .findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(interpreterId) },
          updateDataObj,
          { new: true },
        )
        .populate({
          path: 'personalInfo.countryId',
          select: 'name',
        })
        .populate({
          path: 'personalInfo.cityId',
          select: 'name',
        })
        .populate('nativeLanguages')
        .populate('interpreterInfo.interpretationLanguages')
        .populate('interpreterInfo.expertiseList')
        .populate('interpreterInfo.interpreterRates.languages')
        .exec();
      if (interpreterProfileData) {
        const userDetails: any = interpreterProfileData.toObject();
        const userData = {
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
          profileDetails:
            userDetails &&
            userDetails.interpreterInfo &&
            userDetails.interpreterInfo
              ? userDetails.interpreterInfo.profileDetails
              : '',
          countryId:
            userDetails.personalInfo && userDetails.personalInfo.countryId
              ? await this.utilService.dataMapperObject(
                  userDetails.personalInfo.countryId,
                  appLanguage,
                )
              : {},
          cityId:
            userDetails.personalInfo && userDetails.personalInfo.cityId
              ? await this.utilService.dataMapperObject(
                  userDetails.personalInfo.cityId,
                  appLanguage,
                )
              : {},
          language: [],
          interpreterRates: [],
          expertise: [],
          review: [],
          academicBackground:
            userDetails.interpreterInfo?.academicBackground || [],
          qualification: userDetails.interpreterInfo?.qualification || [],
          metaData: {},
        };

        if (
          userDetails &&
          userDetails.interpreterInfo &&
          userDetails.interpreterInfo &&
          userDetails.interpreterInfo.interpreterRates
        ) {
          const languages = [
            ...userDetails.nativeLanguages.map((lang) => ({
              _id: lang._id,
              name: lang.name?.[appLanguage] || '',
              type: 'native',
            })),
            ...userDetails.interpreterInfo.interpretationLanguages.map(
              (lang) => ({
                _id: lang._id,
                name: lang.name?.[appLanguage] || '',
                type: 'interpretation',
              }),
            ),
          ];

          userData.language = languages;
        }
        if (userDetails.interpreterInfo?.interpreterRates) {
          userData.interpreterRates = await Promise.all(
            userDetails.interpreterInfo.interpreterRates.map(async (rate) => ({
              fee: rate.fee,
              currency: rate.currency,
              languages: await this.utilService.dataMapperArray(
                rate.languages,
                appLanguage,
              ),
            })),
          );
        }
        if (userDetails.interpreterInfo?.expertiseList) {
          userData.expertise = await this.utilService.dataMapperArray(
            userDetails.interpreterInfo.expertiseList,
            appLanguage,
          );
        }
        return {
          success: true,
          info: { interpreterProfileData: userData },
          message: this.i18n.t('lang.DATA_FOUND', { lang: appLanguage }),
        };
      } else {
        this.logger.warn(
          `/interpreter/updateInterpreterProfile=====> No record found ! `,
        );
        return {
          success: false,
          info: {},
          message: this.i18n.t('lang.USER_NOT_FOUND', { lang: appLanguage }),
        };
      }
    } catch (error) {
      this.logger.error(
        `/interpreter/updateInterpreterProfile/=====> catch S error ===> `,
        error,
      );
      return {
        success: false,
        info: {},
        message: error.message,
      };
    }
  }

  async findTotalInterpreterQuery(query: any) {
    try {
      return await this.userModel.countDocuments(query);
    } catch (error) {
      this.logger.error(
        `findTotalInterpreterQuery function=====> catch S error ===> `,
        error,
      );
      return 0;
    }
  }

  async findInterpreterQuery(query: any, page: number, sort_query: any) {
    try {
      const limitRecord = parseInt(process.env.INTERPRETER_USER_LIMIT);
      const skip = (page - 1) * limitRecord;

      const result = await this.userModel
        .find(query)
        .select('interpreterInfo status personalInfo fullName')
        .sort(sort_query)
        .populate({
          path: 'personalInfo.countryId',
          select: 'name',
        })
        .populate({
          path: 'personalInfo.cityId',
          select: 'name',
        })
        .populate({
          path: 'nativeLanguages',
          select: 'name',
        })
        .populate({
          path: 'interpreterInfo.interpretationLanguages',
          select: 'name',
        })
        .populate({
          path: 'interpreterInfo.expertiseList',
          select: 'name',
        })
        .limit(limitRecord)
        .skip(skip);
      return result || [];
    } catch (error) {
      this.logger.error(
        `findInterpreterQuery function =====> catch S error ===> `,
        error,
      );
      return [];
    }
  }

  async saveDocuments(userId: string, docs: any) {
    try {
      const result = await this.userModel.findOneAndUpdate(
        { _id: userId },
        {
          $push: {
            'interpreterInfo.professional.docs': {
              documents: docs,
              isApproved: false,
            },
          },
        },
        { new: true },
      );
      return result && result?.interpreterInfo?.professional;
    } catch (error) {
      this.logger.error(
        `interpreter/uploadProfessionalDocsData function saveDocuments =====> catch S error ===> `,
        error,
      );
      return [];
    }
  }

  async deleteDocuments(userId: string, docs: any, type: any) {
    try {
      let update: any = {};
      if (type) {
        update = {
          'interpreterInfo.professional.docs': { $pull: { _id: docs } },
        };
      } else {
        update = { $unset: { 'interpreterInfo.professional': '' } };
      }
      
      const subobjectData = await this.userModel.findOne(
        { "interpreterInfo.professional.docs._id": new mongoose.Types.ObjectId(docs),_id:userId },
        { "interpreterInfo.professional.docs.$": 1, _id: 0 } 
      );

      if(subobjectData?.interpreterInfo?.professional?.docs){
        await this.s3Service.deleteObj(subobjectData.interpreterInfo.professional.docs[0].documents);
      }

      const result = await this.userModel.findOneAndUpdate(
        { _id: userId },
        update,
        { new: true },
      );
      return result && result?.interpreterInfo?.professional;
    } catch (error) {
      this.logger.error(
        `interpreter/uploadProfessionalDocsData function deleteDocuments =====> catch S error ===> `,
        error,
      );
      return [];
    }
  }

  async getAllReview(userId: any, currentPage: number, limitRecord: number) {
    try {
      const skip = (currentPage - 1) * limitRecord;
      //const query = {_id:userId};TODO GIrraj
      const query = {};
      let review = [];

      const totalRecordes = await this.reviewModel.countDocuments(query);

      const reviewDetails = await this.reviewModel
        .find(query)
        .populate('ratedBy', '_id name personalInfo status fullName')
        .limit(limitRecord)
        .sort({ _id: -1 })
        .skip(skip);

      if (reviewDetails.length > 0) {
        review = await Promise.all(
          reviewDetails.map(async (reviewData) => {
            const reviewDetails: any = reviewData.toObject();
            const userReviewData = {
              _id: reviewDetails._id,
              fullName: reviewDetails.ratedBy.fullName,
              photo: reviewDetails.ratedBy.personalInfo.photo
                ? `${
                    process.env.AWS_S3_BASE +
                    reviewDetails.ratedBy.personalInfo.photo
                  }`
                : '',
              isOnline: reviewDetails.ratedBy.status.isOnline,
              comment: reviewDetails.comment,
              rating: reviewDetails.rating,
            };

            return userReviewData;
          }),
        );
        
      }

      return {
        maxLimit: limitRecord,
        currentPage,
        displayedRecord: totalRecordes,
        reviewData: review,
      };
    } catch (error) {
      this.logger.error(
        `findInterpreterQuery function =====> catch S error ===> `,
        error,
      );
      return [];
    }
  }
}
