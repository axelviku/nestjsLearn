import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { I18nService, I18nLang } from 'nestjs-i18n';
import { User } from 'common/schemas/user.schema';
import { ReferralCode } from 'common/schemas/referralCode.schema';
import { RequestOtp } from 'common/schemas/requestOtp.schema';
import { UtilityService } from 'common/utils/utils.service';
import { TwilioService } from 'common/utils/twilio.service';
import { CommonService } from 'common/utils/common.services';
import { MyLogger } from '../my-logger.service';
import { DataCollectionAndAnalysis } from 'common/schemas/dataCollectionAndAnalysis.schema';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'common/schemas/userRole.schema';
import { constant } from 'common/constant/constant';
import {
  CallSettings,
  ChatSettings,
  EmailSettings,
  MaintenanceMode,
  PaymentSettings,
  PolicyTermsSettings,
  Setting,
} from 'common/schemas/settings.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly i18n: I18nService,
    private readonly utilService: UtilityService,
    private readonly commonService: CommonService,
    private readonly smsService: TwilioService,
    private readonly logger: MyLogger,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(RequestOtp.name) private otpModel: Model<RequestOtp>,
    @InjectModel(UserRole.name) private userRoleModel: Model<UserRole>,
    @InjectModel(Setting.name) private SettingModel: Model<Setting>,

    @InjectModel(ReferralCode.name)
    private referralCodeModel: Model<ReferralCode>,
    @InjectModel(DataCollectionAndAnalysis.name)
    private readonly dataCollectionAndAnalysisModel: Model<DataCollectionAndAnalysis>,
  ) {}

  async requestPhoneOtp(
    requestOtp: { phone: string; countryCode: string },
    deviceInfo: {
      device_name: string;
      device_version: string;
      os: string;
      device_timezone: string;
      app_version: string;
    },
    lang: string,
  ) {
    try {
      this.logger.log(`/auth/requestOtp/=====> requestPhoneOtp ===> `);

      const findUserPhoneOtp = await this.otpModel.findOne({
        'requestOtpType.phoneNumber': requestOtp.phone,
        otpType: 'SIGNUP',
        isVerified: false,
      });
      this.logger.log(
        `/auth/requestOtp/=====> requestPhoneOtp ===> findUserPhoneOtp : `,
        findUserPhoneOtp,
      );

      const currentTime = new Date();
      const validUntil = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
      const validUntilDb =
        findUserPhoneOtp && findUserPhoneOtp.otpValidTillDate
          ? new Date(findUserPhoneOtp.otpValidTillDate.getTime())
          : new Date(currentTime.getTime() + 24 * 60 * 60 * 1000); //TODO MOVE THIS TO COMMON/UTILS FUNCTION

      this.logger.log(
        `/auth/requestOtp/=====> requestPhoneOtp ===> currentTime : `,
        currentTime,
      );
      this.logger.log(
        `/auth/requestOtp/=====> requestPhoneOtp ===> validUntil : `,
        validUntil,
      );
      this.logger.log(
        `/auth/requestOtp/=====> requestPhoneOtp ===> validUntilDb : `,
        validUntilDb,
      );

      this.logger.log(
        `/auth/requestOtp/=====> requestPhoneOtp ===> currentTime >= validUntilDb `,
        currentTime >= validUntilDb,
      );
      this.logger.log(
        `/auth/requestOtp/=====> requestPhoneOtp ===> currentTime <= validUntilDb `,
        currentTime <= validUntilDb,
      );

      if (
        (findUserPhoneOtp && findUserPhoneOtp != null) ||
        findUserPhoneOtp != undefined
      ) {
        this.logger.log(
          `/auth/requestOtp/=====> requestPhoneOtp ===> User already requested a OTP! `,
        );
        if (currentTime >= validUntilDb) {
          this.logger.log(
            `/auth/requestOtp/=====> requestPhoneOtp ===> Daily Limit Not Reached on Same Day ! `,
          );
          if (findUserPhoneOtp && findUserPhoneOtp.resendOtpCounter == 5) {
            this.logger.log(
              `/auth/requestOtp/=====> requestPhoneOtp ===> Daily Resend OTP 5 counter Limit Reached and we RESET the count ! `,
            );
            await this.otpModel.findOneAndUpdate(
              {
                'requestOtpType.phoneNumber': requestOtp.phone,
                otpType: 'SIGNUP',
                isVerified: false,
              },
              {
                resendOtpCounter: 1,
                otpValidTillDate: validUntil,
                deviceInfo: {
                  os: deviceInfo.os,
                  version: deviceInfo.app_version,
                  language: lang,
                  deviceVersion: deviceInfo.device_version,
                  deviceName: deviceInfo.device_name,
                  lastConnectedDate: new Date(),
                  timezone: deviceInfo.device_timezone,
                },
              },
              { new: true },
            );
            return {
              success: true,
              info: {
                otpsent: false,
                count: 1,
              },
              message: this.i18n.t('lang.OTP_SENT', { lang: lang }),
            };
          } else {
            this.logger.log(
              `/auth/requestOtp/=====> requestPhoneOtp ===> Daily Resend OTP Limit Not Reached , New OTP sent ! `,
            );
            const updateSeq = await this.otpModel.findOneAndUpdate(
              {
                'requestOtpType.phoneNumber': requestOtp.phone,
                otpType: 'SIGNUP',
                isVerified: false,
              },
              {
                $inc: { resendOtpCounter: 1 },
                otpValidTillDate: validUntil,
                deviceInfo: {
                  os: deviceInfo.os,
                  version: deviceInfo.app_version,
                  language: lang,
                  deviceVersion: deviceInfo.device_version,
                  deviceName: deviceInfo.device_name,
                  lastConnectedDate: new Date(),
                  timezone: deviceInfo.device_timezone,
                },
              },
              { new: true },
            );
            return {
              success: true,
              info: {
                otpsent: true,
                count: updateSeq.resendOtpCounter,
              },
              message: this.i18n.t('lang.OTP_SENT', { lang: lang }),
            };
          }
        } else {
          this.logger.log(
            `/auth/requestOtp/=====> requestPhoneOtp ===> Daily Limit Date condition Reached, But available for New Day ! `,
          );
          // const twilioOtp = await this.smsService.twilioSendPhoneOtp(requestOtp:string); //TODO SAVE TWILIO OBJ IN REQ AND VERIFY BOTH
          if (findUserPhoneOtp && findUserPhoneOtp.resendOtpCounter == 5) {
            this.logger.log(
              `/auth/requestOtp/=====> requestPhoneOtp ===> Daily OTP Limit 5 counter Reached on Same day ! `,
            );
            return {
              success: true,
              info: {
                otpsent: false,
                count: findUserPhoneOtp.resendOtpCounter,
              },
              message: this.i18n.t('lang.sms_limit_reached', { lang: lang }),
            };
          } else {
            this.logger.log(
              `/auth/requestOtp/=====> requestPhoneOtp ===> New Entry for OTP ! `,
            );
            const updateSeq = await this.otpModel.findOneAndUpdate(
              {
                'requestOtpType.phoneNumber': requestOtp.phone,
                otpType: 'SIGNUP',
                isVerified: false,
              },
              {
                $inc: { resendOtpCounter: 1 },
                otpValidTillDate: validUntil,
                deviceInfo: {
                  os: deviceInfo.os,
                  version: deviceInfo.app_version,
                  language: lang,
                  deviceVersion: deviceInfo.device_version,
                  deviceName: deviceInfo.device_name,
                  lastConnectedDate: new Date(),
                  timezone: deviceInfo.device_timezone,
                },
              },
              { new: true },
            );
            return {
              success: true,
              info: {
                count: updateSeq.resendOtpCounter,
                otpsent: true,
              },
              message: this.i18n.t('lang.OTP_SENT', { lang: lang }),
            };
          }
        }
      } else {
        this.logger.log(
          `/auth/requestOtp/=====> requestPhoneOtp ===> User request New First Entry for a OTP !! `,
        );
        // const twilioOtp = await this.smsService.twilioSendPhoneOtp(requestOtp);
        const twilioOtp = { status: 'pending' };
        if (twilioOtp && twilioOtp.status === 'pending') {
          await this.otpModel.create({
            otp: '123456', //twilioOtp.otp
            'requestOtpType.phoneNumber': requestOtp.phone,
            otpType: 'SIGNUP',
            'requestOtpType.countryCode': requestOtp.countryCode,
            otpValidTillDate: validUntil,
            deviceInfo: {
              os: deviceInfo.os,
              version: deviceInfo.app_version,
              language: lang,
              deviceVersion: deviceInfo.device_version,
              deviceName: deviceInfo.device_name,
              lastConnectedDate: new Date(),
              timezone: deviceInfo.device_timezone,
            },
          });

          return {
            success: true,
            info: {
              count: 1,
              otpsent: true,
            },
            message: this.i18n.t('lang.OTP_SENT', { lang: lang }),
          };
        } else {
          this.logger.log(
            `/auth/requestOtp/=====> requestPhoneOtp ===> findUserPhoneOtp ===> twilioOtp error : `,
            twilioOtp,
          );
          return {
            success: false,
            info: {
              count: 0,
              otpsent: false,
            },
            message: twilioOtp, //TODO UNABLE TO SEND OTP MSG
          };
        }
      }
    } catch (error) {
      this.logger.log(
        `/auth/requestOtp/=====> requestPhoneOtp ===> error : `,
        error,
      );
      return {
        success: false,
        info: {
          count: 0,
          otpsent: false,
        },
        message: error.message,
      };
    }
  }

  async verifyOTPPhone(otp: any, lang: string) {
    try {
      const otpCheck = await this.otpModel.findOne(
        { otp: otp.otp, 'requestOtpType.phoneNumber': otp.phone }, //TODO COUTNRY CODE
        { isVerified: false },
      );

      this.logger.log(
        `/auth/verifyOtp/=====> verifyOTPPhone ===> otpCheck ====>  : `,
        otpCheck,
      );

      if ((!otpCheck && otpCheck == null) || otpCheck == undefined) {
        return {
          success: false,
          info: { status: 'incorrect' },
          message: this.i18n.t('lang.OTP_INCORRECT', { lang: lang }),
        };
      }
      // const verificationCheck = await this.smsService.phoneOtpVerify(otp); //TODO
      //  this.logger.log(`/auth/verifyOtp/=====> verifyOTPPhone ===> verificationCheck ====>  : `, verificationCheck);
      const verificationCheck = {
        status: 'approved',
      };
      if (verificationCheck.status === 'approved') {
        this.logger.log(
          `/auth/verifyOtp/=====> verifyOTPPhone ===> verificationCheckStatus  approved====>  : `,
          verificationCheck.status,
        );

        await this.otpModel.updateOne(
          { 'requestOtpType.phoneNumber': otp.phone },
          { isVerified: true },
        );
        return {
          success: true,
          info: { status: verificationCheck.status },
          message: this.i18n.t('lang.OTP_VERIFIED', { lang: lang }),
        };
      } else {
        this.logger.log(
          `/auth/verifyOtp/=====> verifyOTPPhone ===> verificationCheckStatus  inncorect====>  : `,
        );
        return {
          success: false,
          info: { status: verificationCheck.status },
          message: this.i18n.t('lang.OTP_INCORRECT', { lang: lang }),
        };
      }
    } catch (error) {
      this.logger.log(
        `/auth/verifyOtp/=====> verifyOTPPhone ===>  error : `,
        error,
      );
      return {
        success: false,
        info: {
          status: '',
        },
        message: error.message,
      };
    }
  }

  async requestEmailOtp(
    requestOtp: { email: string },
    deviceInfo: {
      device_name: string;
      device_version: string;
      os: string;
      device_timezone: string;
      app_version: string;
    },
    lang: string,
  ) {
    try {
      this.logger.log(`/auth/requestOtp/=====> requestEmailOtp ===> `);
      const findUserEmailOtp = await this.otpModel.findOne({
        'requestOtpType.emailAddress': requestOtp.email,
        otpType: 'SIGNUP',
        isVerified: false,
      });

      const currentTime = new Date();
      const validUntil = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
      const validUntilDb =
        findUserEmailOtp && findUserEmailOtp.otpValidTillDate
          ? new Date(findUserEmailOtp.otpValidTillDate.getTime())
          : new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);

      this.logger.log(
        `/auth/requestOtp/=====> requestEmailOtp ===> currentTime : `,
        currentTime,
      );
      this.logger.log(
        `/auth/requestOtp/=====> requestEmailOtp ===> validUntil : `,
        validUntil,
      );
      this.logger.log(
        `/auth/requestOtp/=====> requestEmailOtp ===> validUntilDb : `,
        validUntilDb,
      );

      this.logger.log(
        `/auth/requestOtp/=====> requestEmailOtp ===> currentTime >= validUntilDb `,
        currentTime >= validUntilDb,
      );
      this.logger.log(
        `/auth/requestOtp/=====> requestEmailOtp ===> currentTime <= validUntilDb `,
        currentTime <= validUntilDb,
      );

      this.logger.log(
        `/auth/requestOtp/=====> requestEmailOtp ===> findUserEmailOtp : `,
        findUserEmailOtp,
      );
      if (findUserEmailOtp != null || findUserEmailOtp != undefined) {
        this.logger.log(
          `/auth/requestOtp/=====> requestEmailOtp ===> user already requested a OTP! `,
        );
        if (currentTime >= validUntilDb) {
          this.logger.log(
            `/auth/requestOtp/=====> requestEmailOtp ===> Daily Limit Not Reached ! `,
          );
          if (findUserEmailOtp && findUserEmailOtp.resendOtpCounter == 5) {
            this.logger.log(
              `/auth/requestOtp/=====> requestEmailOtp ===> Daily Resend OTP Limit Reached on Same day ! `,
            );
            await this.otpModel.findOneAndUpdate(
              {
                'requestOtpType.emailAddress': requestOtp.email,
                otpType: 'SIGNUP',
                isVerified: false,
              },
              {
                resendOtpCounter: 1,
                otpValidTillDate: validUntil,
                deviceInfo: {
                  os: deviceInfo.os,
                  version: deviceInfo.app_version,
                  language: lang,
                  deviceVersion: deviceInfo.device_version,
                  deviceName: deviceInfo.device_name,
                  lastConnectedDate: new Date(),
                  timezone: deviceInfo.device_timezone,
                },
              },
              { new: true },
            );
            return {
              success: true,
              info: {
                otpsent: false,
                count: 1,
              },
              message: this.i18n.t('lang.OTP_SENT', { lang: lang }),
            };
          } else {
            this.logger.log(
              `/auth/requestOtp/=====> requestEmailOtp ===> Daily Resend OTP Limit Not Reached ! `,
            );
            // const twilioOtp = await this.smsService.sendEmail(requestOtp.email);
            const updateSeq = await this.otpModel.findOneAndUpdate(
              {
                'requestOtpType.emailAddress': requestOtp.email,
                otpType: 'SIGNUP',
                isVerified: false,
              },
              {
                $inc: { resendOtpCounter: 1 },
                otpValidTillDate: validUntil,
                deviceInfo: {
                  os: deviceInfo.os,
                  version: deviceInfo.app_version,
                  language: lang,
                  deviceVersion: deviceInfo.device_version,
                  deviceName: deviceInfo.device_name,
                  lastConnectedDate: new Date(),
                  timezone: deviceInfo.device_timezone,
                },
              },
              { new: true },
            );
            return {
              success: true,
              info: {
                otpsent: true,
                count: updateSeq.resendOtpCounter,
              },
              message: this.i18n.t('lang.OTP_SENT', { lang: lang }),
            };
          }
        } else {
          this.logger.log(
            `/auth/requestOtp/=====> requestEmailOtp ===> Daily Limit Reached, But available for New Day ! `,
          );
          // const twilioOtp = await this.smsService.sendEmail(requestOtp.email); //TODO SAVE TWILIO OBJ IN REQ AND VERIFY BOTH
          if (findUserEmailOtp && findUserEmailOtp.resendOtpCounter == 5) {
            this.logger.log(
              `/auth/requestOtp/=====> requestEmailOtp ===> Daily Resend OTP Limit Reached on Same day ! `,
            );
            return {
              success: true,
              info: {
                otpsent: false,
                count: findUserEmailOtp.resendOtpCounter,
              },
              message: this.i18n.t('lang.sms_limit_reached', { lang: lang }),
            };
          } else {
            // const twilioOtp = await this.smsService.sendEmail(requestOtp.email);
            const updateSeq = await this.otpModel.findOneAndUpdate(
              {
                'requestOtpType.emailAddress': requestOtp.email,
                otpType: 'SIGNUP',
                isVerified: false,
              },
              {
                $inc: { resendOtpCounter: 1 },
                otpValidTillDate: validUntil,
                deviceInfo: {
                  os: deviceInfo.os,
                  version: deviceInfo.app_version,
                  language: lang,
                  deviceVersion: deviceInfo.device_version,
                  deviceName: deviceInfo.device_name,
                  lastConnectedDate: new Date(),
                  timezone: deviceInfo.device_timezone,
                },
              },
              { new: true },
            );
            return {
              success: true,
              info: {
                count: updateSeq.resendOtpCounter,
                otpsent: true,
              },
              message: this.i18n.t('lang.OTP_SENT', { lang: lang }),
            };
          }
        }
      } else {
        this.logger.log(
          `/auth/requestOtp/=====> requestEmailOtp ===> New First Entry !! `,
        );
        // const twilioOtp = await this.smsService.sendEmail(requestOtp.email);
        const twilioOtp = { status: 'pending' };
        if (twilioOtp && twilioOtp.status === 'pending') {
          await this.otpModel.create({
            otp: '123456', //twilioOtp.otp
            'requestOtpType.emailAddress': requestOtp.email,
            otpType: 'SIGNUP',
            otpValidTillDate: validUntil,
            deviceInfo: {
              os: deviceInfo.os,
              version: deviceInfo.app_version,
              language: lang,
              deviceVersion: deviceInfo.device_version,
              deviceName: deviceInfo.device_name,
              lastConnectedDate: new Date(),
              timezone: deviceInfo.device_timezone,
            },
          });

          return {
            success: true,
            info: {
              count: 1,
              otpsent: true,
            },
            message: this.i18n.t('lang.OTP_SENT', { lang: lang }),
          };
        } else {
          this.logger.log(
            `/auth/requestOtp/=====> requestEmailOtp ===> findUserEmailOtp ===> twilioOtp error : `,
            twilioOtp,
          );
          return {
            success: false,
            info: {
              count: 0,
              otpsent: false,
            },
            message: twilioOtp, //TODO UNABLE TO SEND OTP MSG
          };
        }
      }
    } catch (error) {
      this.logger.log(
        `/auth/requestOtp/=====> requestEmailOtp ===> findUserEmailOtp ===> error : `,
        error,
      );
      return {
        success: false,
        info: {
          count: 0,
          otpsent: false,
        },
        message: error.message,
      };
    }
  }

  async verifyOTPEmail(otp: any, lang: string) {
    try {
      const otpCheck = await this.otpModel.findOne(
        { otp: otp.otp, 'requestOtpType.emailAddress': otp.email },
        { isVerified: false },
      );

      this.logger.log(
        `/auth/verifyOtp/=====> verifyOTPEmail ===> otpCheck ====>  : `,
        otpCheck,
      );

      if ((!otpCheck && otpCheck == null) || otpCheck == undefined) {
        return {
          success: false,
          info: { status: 'incorrect' },
          message: this.i18n.t('lang.OTP_INCORRECT', { lang: lang }),
        };
      }
      // const verificationCheck = await this.smsService.otpVerifyEmail(otp);
      //  this.logger.log(`/auth/verifyOtp/=====> verifyOTPEmail ===> verificationCheck ====>  : `, verificationCheck);
      const verificationCheck = {
        status: 'approved',
      };
      if (verificationCheck.status === 'approved') {
        this.logger.log(
          `/auth/verifyOtp/=====> verifyOTPEmail ===> verificationCheckStatus  approved====>  : `,
          verificationCheck.status,
        );
        await this.otpModel.updateOne(
          { 'requestOtpType.emailAddress': otp.email },
          { isVerified: true },
        );
        return {
          success: true,
          info: { status: verificationCheck.status },
          message: this.i18n.t('lang.OTP_VERIFIED', { lang: lang }),
        };
      } else {
        this.logger.log(
          `/auth/verifyOtp/=====> verifyOTPEmail ===> incorrect otp====>  : `,
        );
        return {
          success: false,
          info: { status: verificationCheck.status },
          message: this.i18n.t('lang.OTP_INCORRECT', { lang: lang }),
        };
      }
    } catch (error) {
      this.logger.log(
        `/auth/verifyOtp/=====> verifyOTPEmail ===>  error : `,
        error,
      );
      return {
        success: false,
        info: {
          status: ' ',
        },
        message: error.message,
      };
    }
  }

  async verifyReferralCode(code: string, lang: string) {
    try {
      const refCodeResult = await this.referralCodeModel.findOne({
        referralCode: code,
        isActive: true,
      });
      this.logger.log(
        `/auth/verifyReferralCode/=====> refCodeResult : `,
        refCodeResult,
      );
      if (!refCodeResult)
        return {
          success: false,
          message: this.i18n.t('lang.REFERAL_CODE_INVALID', { lang: lang }),
        };

      return {
        success: true,
        info: {},
        message: this.i18n.t('lang.referral_code_verify', { lang: lang }),
      };
    } catch (error) {
      this.logger.log(
        `/auth/verifyReferralCode/=====> Catch S error : `,
        error,
      );

      return {
        success: false,
        info: {},
        message: this.i18n.t('lang.ERROR_IN_REG', { lang: lang }),
      };
    }
  }

  //TODO RESET PASSWORD WITH LINK- PART 1
  async forgetWithEmailOtp(email: string, lang: string) {
    try {
      const findUserOtp = await this.otpModel.findOne({
        'requestOtpType.emailAddress': email,
        otpType: 'FORGOTPASSWORD',
        isVerified: false,
      });
      if (findUserOtp && findUserOtp.resendOtpCounter >= 5) {
        return {
          status: false,
          info: {
            otpsent: false,
          },
          message: this.i18n.t('lang.sms_limit_reached', { lang: lang }),
        };
      }
      if (findUserOtp != null || findUserOtp != undefined) {
        const updateSeq = await this.otpModel.findOneAndUpdate(
          { 'requestOtpType.emailAddress': email },
          { $inc: { resendOtpCounter: 1 } },
          { new: true },
        );
        return {
          status: true,
          info: { count: updateSeq.resendOtpCounter },
          message: this.i18n.t('lang.OTP_SENT', { lang: lang }),
        };
      } else {
        await this.otpModel.create({
          otp: '123456',
          'requestOtpType.emailAddress': email,
          otpType: 'FORGOTPASSWORD',
        });
        // const twilioOtp = await this.smsService.sendEmail(email);
        const twilioOtp = {
          status: 'pending',
        };
        if (twilioOtp.status === 'pending') {
          return {
            status: true,
            info: {
              count: 1,
            },
            message: this.i18n.t('lang.OTP_SENT', { lang: lang }),
          };
        }
      }
    } catch (error) {
      return {
        status: false,
        info: {},
        message: error.message,
      };
    }
  }

  //TODO RESET PASSWORD WITH LINK - PART 2
  async changePassword(data: {
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    const { email, password, confirmPassword } = data;
    try {
      if (password !== confirmPassword) {
        return { status: false, message: 'Passwords do not match' };
      }
      const user = await this.userModel.findOne(
        { email },
        { projection: { password: 1 } },
      );
      console.log('user', user);
      if (!user) {
        return { status: false, message: 'User not found' };
      }
      user.password = confirmPassword;

      await user.save();
      return { status: true, message: 'Password change successfully' };
    } catch (error) {
      return {
        status: false,
        message: error.message,
      };
    }
  }

  async getUserRoleName(roleId: any) {
    const getUserRole = await this.userRoleModel.findOne({
      _id: roleId,
      isActive: true,
    });
    this.logger.log(`/auth/requestOtp/=====> getUserRole ===> : `, getUserRole);

    return getUserRole.slug;
  }

  async dataCollectionAndAnalysisFetchAndUpdateRecord(
    userId: string,
    roleId: string,
    lang: string,
    dataAnaylysisScreen: boolean,
    tutorialScreen: boolean,
    type: string,
  ): Promise<object> {
    try {
      if (type && type === constant.FETCH_DAC_DATA) {
        this.logger.log(
          `/auth/dataCollectionAndAnalysis/=====> FETCH_DAC_DATA`,
        );

        const getUserRole = await this.userRoleModel.findOne({
          _id: roleId,
          isActive: true,
        });
        this.logger.log(
          `/auth/requestOtp/=====> getUserRole ===> : `,
          getUserRole,
        );

        const userRoleName = getUserRole.slug;
        const dataCollection = await this.SettingModel.findOne({
          'dataCollectionAndAnalysis.userRoleName': userRoleName,
        })
          .lean()
          .exec();

        if (
          dataCollection &&
          Array.isArray(dataCollection.dataCollectionAndAnalysis)
        ) {
          let userRoleData = null;
          for (const item of dataCollection.dataCollectionAndAnalysis) {
            if (item.userRoleName === userRoleName) {
              userRoleData = item;
              break;
            }
          }
          if (userRoleData) {
            const title = userRoleData.title[lang];
            const description = userRoleData.description[lang];
            const longDescription = userRoleData.longDescription[lang];
            return {
              success: true,
              info: {
                dataCollectionAndAnalysis: {
                  title,
                  description,
                  longDescription,
                },
              },
              message: this.i18n.t('lang.data_collection_and_analysis', {
                lang: lang,
              }),
            };
          } else {
            return {
              success: false,
              info: {
                dataCollectionAndAnalysis: {},
              },
              message: this.i18n.t('lang.NO_RECORD_FOUND', {
                lang: lang,
              }),
            };
          }
        } else {
          this.logger.log(
            `/auth/requestOtp/=====> dataCollection ===> : `,
            dataCollection,
          );
          return {
            success: true,
            info: {
              dataCollectionAndAnalysis: {},
            },
            message: this.i18n.t('lang.data_collection_and_analysis', {
              lang: lang,
            }),
          };
        }
      } else if (type && type === constant.POST_DCA_DATA) {
        this.logger.log(`/auth/dataCollectionAndAnalysis/=====> POST_DCA_DATA`);
        const user = new mongoose.Types.ObjectId(userId);

        let updateQuery = {};
        if (dataAnaylysisScreen == true) {
          updateQuery = { 'registrationSteps.dataAnalysisScreen': true };
        }
        if (tutorialScreen == true) {
          updateQuery = {
            'registrationSteps.tutorialScreen': true,
            'status.profileStatus': 'Complete',
          };
        }
        return this.userModel
          .findOneAndUpdate({ _id: user }, { $set: updateQuery }, { new: true })
          .then((result) => {
            if (result) {
              return {
                success: true,
                info: {
                  registrationSteps: result.registrationSteps,
                },
                message: this.i18n.t('lang.data_collection', { lang: lang }),
              };
            } else {
              return {
                success: false,
                info: {
                  dataCollectionAndAnalysis: {},
                },
                message: this.i18n.t('lang.data_collection_not_update', {
                  lang: lang,
                }),
              };
            }
          })
          .catch((error) => {
            this.logger.log(
              `/auth/dataCollectionAndAnalysis/=====> Catch S Error: `,
              error,
            );
            return {
              success: false,
              info: {
                dataCollectionAndAnalysis: {},
              },
              message: error.message,
            };
          });
      } else {
        this.logger.log(`/auth/dataCollectionAndAnalysis/=====> INVALID TYPE`);
        return {
          success: false,
          info: {
            dataCollectionAndAnalysis: {},
          },
          message: this.i18n.t('lang.data_collection_not_update', {
            //TODO - invalid type msg
            lang: lang,
          }),
        };
      }
    } catch (error) {
      this.logger.log(
        `/auth/dataCollectionAndAnalysis/=====> Catch S Error : `,
        error,
      );
      return {
        success: false,
        info: {
          dataCollectionAndAnalysis: {},
        },
        message: error.message,
      };
    }
  }

  async signUp(lang: string, SignUpBody: any, headers: any) {
    try {
      const {
        email,
        gender,
        isPTFlag,
        fullName,
        source,
        password,
        gdprAccepted,
        countryId,
        timezone,
        preferredCurrency,
        referralCode,
        nativeLanguages,
        socialId,
        socialType,
        prefectureId,
        photo,
        cityId,
      } = SignUpBody;
      const emailFind = await this.commonService.emailExist(email);
      if (emailFind.status) {
        return {
          success: false,
          message: this.i18n.t('lang.EMAIL_ALREADY_EXISTS', { lang: lang }),
        };
      } else {
        if (referralCode) {
          const checkReferalCode = await this.verifyReferralCode(
            referralCode,
            lang,
          );
          if (checkReferalCode.success) {
            return {
              success: false,
              message: this.i18n.t('lang.REFERAL_CODE_INVALID', {
                lang: lang,
              }),
            };
          }
        }

        const roleDetails = await this.userRoleModel.findOne({
          slug: 'client',
        });

        const data = {
          fullName,
          source,
          roleId: roleDetails._id,
          userReferralCode: referralCode,
          email,
          password,
          social:
            source == 'social' ? [{ type: socialType, id: socialId }] : [],
          mobile: '',
          formattedMobile: '',
          personalInfo: {
            userNo: '1',
            gender,
            photo,
            countryId,
            cityId,
            preferredCurrency,
          },
          userNotifications: {
            isNotify: false,
            lastNotification: Date.now(),
            badge: 0,
          },
          status: {
            isPTFlag,
            gdprAccepted,
          },
          token: {
            arn: 'arn',
            voip: 'voip',
            login: 'login',
          },
          deviceInfo: {
            os: headers.os,
            version: headers.version,
            language: headers.language,
            deviceVersion: headers.device_version,
            deviceName: headers.device_name,
            timezone,
            lastConnectedDate: new Date(),
          },
          verification: {
            email: true,
          },
          registrationSteps: {
            emailVerify: true,
            registerScreen: true,
          },
          nativeLanguages,
          prefectureId,
        };

        const createdUser = new this.userModel(data);
        const savedUser = await createdUser.save();
        if (savedUser) {
          const token: string = this.utilService.generateLoginToken(
            savedUser._id.toString(),
          );
          const savedData = await this.userModel.findOneAndUpdate(
            { _id: savedUser._id },
            { 'token.login': token },
            { new: true },
          );

          const responseData = {
            _id: savedData._id,
            fullName: savedData.fullName,
            email: savedData.email,
            notifications: savedData.userNotifications,
            token: savedData.token,
            isOnline: savedData.status.isOnline,
            profileStatus: savedData.status.profileStatus,
            personalInfo: savedData.personalInfo,
            role: {
              _id: roleDetails._id,
              slug: roleDetails.slug,
            },
            registrationSteps: savedData.registrationSteps,
          };

          return {
            success: true,
            info: {
              user: responseData,
              message: this.i18n.t('lang.successful_register_msg', {
                lang: lang,
              }),
            },
          };
        } else {
          return {
            success: false,
            message: this.i18n.t('lang.ERROR_IN_REG', { lang: lang }),
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async signUpInterpreter(lang: string, SignUpBody, headers: any) {
    try {
      const {
        email,
        gender,
        isPTFlag,
        fullName,
        source,
        password,
        gdprAccepted,
        countryId,
        timezone,
        preferredCurrency,
        referralCode,
        nativeLanguages,
        socialId,
        socialType,
        prefectureId,
        photo,
        cityId,
        profileDetails,
        speakingLanguages,
        expertiseList,
        associations,
        quilification,
        academicBackground,
        professionalDocs,
        interpretationLanguages,
      } = SignUpBody;
      const emailFind = await this.commonService.emailExist(email);
      if (emailFind.status) {
        return {
          success: false,
          message: this.i18n.t('lang.EMAIL_ALREADY_EXISTS', { lang: lang }),
        };
      } else {
        if (referralCode) {
          const checkReferalCode = await this.verifyReferralCode(
            referralCode,
            lang,
          );
          if (checkReferalCode.success) {
            return {
              success: false,
              message: this.i18n.t('lang.REFERAL_CODE_INVALID', {
                lang: lang,
              }),
            };
          }
        }

        const roleDetails = await this.userRoleModel.findOne({
          slug: 'interpreter',
        });

        const data = {
          fullName,
          source,
          roleId: roleDetails._id,
          userReferralCode: referralCode,
          email,
          password,
          social:
            source == 'social' ? [{ type: socialType, id: socialId }] : [],
          mobile: '',
          formattedMobile: '',
          personalInfo: {
            userNo: '1',
            gender,
            photo,
            countryId,
            cityId,
            preferredCurrency,
          },
          userNotifications: {
            isNotify: false,
            lastNotification: Date.now(),
            badge: 0,
          },
          status: {
            isLogin: true,
            isPTFlag,
            gdprAccepted,
          },
          token: {
            arn: 'arn',
            voip: 'voip',
            login: 'login',
          },
          deviceInfo: {
            os: headers.os,
            version: headers.version,
            language: headers.language,
            deviceVersion: headers.device_version,
            deviceName: headers.device_name,
            timezone,
            lastConnectedDate: new Date(),
          },
          verification: {
            email: true,
          },
          registrationSteps: {
            emailVerify: true,
            registerScreen: true,
          },
          nativeLanguages,
          prefectureId,
          interpreterInfo: {
            profileDetails,
            speakingLanguages,
            interpretationLanguages,
            expertiseList,
            associations,
            quilification,
            academicBackground,
            professionalDocs,
          },
        };

        const createdUser = new this.userModel(data);

        const savedUser = await createdUser.save();
        if (savedUser) {
          const token: string = this.utilService.generateLoginToken(
            savedUser._id.toString(),
          );
          const savedData = await this.userModel.findOneAndUpdate(
            { _id: savedUser._id },
            { 'token.login': token },
            { new: true },
          );

          const responseData = {
            _id: savedData._id,
            fullName: savedData.fullName,
            email: savedData.email,
            notifications: savedData.userNotifications,
            token: savedData.token,
            isOnline: savedData.status.isOnline,
            profileStatus: savedData.status.profileStatus,
            personalInfo: savedData.personalInfo,
            role: {
              _id: roleDetails._id,
              slug: roleDetails.slug,
            },
            registrationSteps: savedData.registrationSteps,
          };

          return {
            success: true,
            info: {
              user: responseData,
              message: this.i18n.t('lang.successful_register_msg', {
                lang: lang,
              }),
            },
          };
        } else {
          return {
            success: false,
            message: this.i18n.t('lang.ERROR_IN_REG', { lang: lang }),
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async LoginServices(loginData: any, headers: any, lang: string) {
    try {
      const email = loginData.email.toLowerCase();
      const password = loginData.password;
      const user: any = await this.userModel
        .findOne({
          email,
        })
        .select(
          '_id password interpreterInfo status email source email_verified userReferralCode personalInfo deviceInfo roleId',
        );
      // .populate('interpreterInfo.nativeLanguages');

      if (!user) {
        return {
          success: false,
          message: this.i18n.t('lang.invalid_credentials', { lang: lang }),
        };
      }

      if (user.status.isSelfdelete) {
        return {
          success: false,
          message: this.i18n.t('lang.account_not_active_deleted', {
            lang: lang,
          }),
        };
      }

      if (!user.status.isActive) {
        return {
          success: false,
          message: this.i18n.t('lang.account_not_active', { lang: lang }),
        };
      }

      // if (user.source === 'social') {
      //   return {
      //     success: false,
      //     message: this.i18n.t('lang.email_registered_with_social', { lang: lang }),
      //   };
      // }

      const isPasswordMatching = await bcrypt.compare(password, user.password);
      if (!isPasswordMatching) {
        return {
          success: false,
          message: this.i18n.t('lang.invalid_credentials', { lang: lang }),
        };
      }

      const token = this.utilService.generateLoginToken(user._id);
      await this.userModel.updateOne(
        { _id: user._id },
        {
          $set: {
            //is_online: user.last_is_online,
            deviceInfo: {
              os: headers.os,
              version: headers.version,
              language: headers.language,
              deviceVersion: headers.device_version,
              deviceName: headers.device_name,
              timezone: loginData.timeZone,
              lastConnectedDate: new Date(),
            },
            'token.login': token,
            'token.voip': loginData.voipToken,
            'status.isLogin': true,
          },
        },
      );

      const userData = await this.commonService.userDetail({ _id: user._id });
      const roleData = await this.commonService.userRole(user.roleId);

      if (userData) {
        // const userSendData = {
        //   loginToken: token,
        //   roleId: roleData ? roleData : {},
        //   isOnline: userData.status.isOnline,
        //   isLogin: userData.status.isLogin,
        //   staff_designation: "enterpriseCompanyForeigner.staff_designation",
        //   foreginer_working_at: "enterpriseCompanyForeigner.foreginer_working_at",
        //   profileStatus: userData.status.profileStatus,
        //   emailVerify: userData.registrationSteps.emailVerify == true ? true : false,
        //   dataAnalysisScreen : userData.registrationSteps.dataAnalysisScreen ==true ? true :false,
        //   isNotify: userData.userNotifications.isNotify,
        //   language: userData.deviceInfo.language,
        //   credits: 0,
        //   earnedCredits: 0,
        //   currency: userData.personalInfo.preferredCurrency,
        //   gdprAccepted: userData.status.gdprAccepted,
        //   isAvailableForCall: userData.status.isAvailableForCall,
        //   isPTFlag: userData.status.isPTFlag,
        //   fullName: userData.fullName,
        //   email: userData.email,
        //   source: userData.source,
        //   userType: "normal",
        //   os: userData.deviceInfo.os,
        //   userReferralCode: {},
        //   arn: userData.token.arn,
        //   voip: userData.token.voip,
        //   photo: userData.personalInfo.photo,
        //   displayResponseRrate: true,
        //   currency_name: userData.personalInfo.preferredCurrency,
        //   userReferralCodeData: {},
        // }

        const responseData = {
          _id: userData._id,
          fullName: userData.fullName,
          email: userData.email,
          notifications: userData.userNotifications,
          token: userData.token,
          isOnline: userData.status.isOnline,
          profileStatus: userData.status.profileStatus,
          personalInfo: userData.personalInfo,
          role: {
            _id: roleData._id,
            slug: roleData.slug,
          },
          registrationSteps: userData.registrationSteps,
        };
        return {
          success: true,
          info: {
            user: responseData,
          },
          message: this.i18n.t('lang.login_successfully', { lang: lang }),
        };
      } else {
        return {
          success: true,
          info: {
            user: {},
          },
          message: this.i18n.t('lang.login_successfully', { lang: lang }),
        };
      }
    } catch (error) {
      console.log(error);
      return {
        success: true,
        info: {
          loginToken: '',
          user: {},
        },
        message: this.i18n.t('lang.login_successfully', { lang: lang }),
      };
    }
  }
}
