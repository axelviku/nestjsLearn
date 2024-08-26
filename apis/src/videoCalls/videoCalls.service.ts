import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { SNSService } from 'common/sns';
import { constant, minimumRate } from 'common/constant/constant';

import { User } from 'common/schemas/user.schema';
import { ReferralCode } from 'common/schemas/referralCode.schema';
import { Setting } from 'common/schemas/setting.schema';

import { UtilityService } from 'common/utils/utils.service';
import { TwilioService } from 'common/utils/twilio.service';
import { CommonService } from 'common/utils/common.services';
import { MyLogger } from '../my-logger.service';

const AccessToken = require("twilio").jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;
const VideoGrant = AccessToken.VideoGrant;
const VoiceResponse = require("twilio").twiml.VoiceResponse;

@Injectable()
export class VideoCallsService {

  private twilioAccountSid: string;
  private twilioAuthToken: string;
  private twilioAppSid: string;
  private twilioApiSecret: string;
  private androidPushSid: string;
  private iosPushSid: string;
  private twilioApiKey :string;

  constructor(
    private readonly i18n: I18nService,
    private readonly utilService: UtilityService,
    private readonly commonService: CommonService,
    private readonly smsService: TwilioService,
    private readonly logger: MyLogger,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Setting.name) private SettingModel: Model<Setting>,
    @InjectModel(ReferralCode.name)
    private referralCodeModel: Model<ReferralCode>,
  ) {

    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioApiSecret = process.env.TWILIO_API_SECRET;
    this.twilioApiKey = process.env.TWILIO_API_KEY;
    this.twilioAppSid = process.env.TWILIO_APP_SID;
    this.androidPushSid = process.env.ANDROID_PUSH_SID;
    this.iosPushSid = process.env.IOS_PUSH_SID;
  }

  async requestCallingVideoToken(
     _id:string, 
    roleId:string,
    language: string,
    os:string,
    currency:string
  ) {
    try {
      this.logger.log(
        `/videoCalls/token/=====> requestCallingVideoToken : ${_id}, ${language} ${os}, ${currency}`
      );

      let displayMessage = false;
      let isCardStatus = false;
      let isVerifiedStatus = false;
      let dues = 0;
      const identity = _id.toString();
      const videoGrant = new VideoGrant();

      const token = new AccessToken(
        this.twilioAccountSid,
        this.twilioApiKey,
        this.twilioApiSecret,
        {identity: identity}
      );
      token.addGrant(videoGrant);

      this.logger.log(
        `/videoCalls/token/=====> requestCallingVideoToken ==== token :`, token
      );

      return {
        success: true,
        info: {
          identity: identity,
          token: token.toJwt(),
          credits: 0,
          displayMessage: displayMessage,
          isCardStatus: isCardStatus,
          lastPaymentDue: dues == 0 ? false : true,
          isVerifiedStatus: isVerifiedStatus,
          reply:
            dues == 0
              ? ""
              : this.i18n.t('lang.LAST_PAYMENT_DUE', { lang: language }),
        },
        message: this.i18n.t('lang.TOKEN_SUCCESS', { lang: language }),
      };
    } catch (error) {
      this.logger.error(
        `/videoCalls/token/=====> requestCallingVideoToken S ===> error : `,
        error,
      );
      return {
        success: false,
        info: {
        },
        message: error.message,
      };
    }
  }
}
