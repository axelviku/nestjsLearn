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

import * as Twilio from 'twilio';
import { jwt } from 'twilio';
// const Twilio = require("twilio");
// const AccessToken = require("twilio").jwt.AccessToken;
// const VoiceGrant = AccessToken.VoiceGrant;
// const VoiceResponse = require("twilio").twiml.VoiceResponse;

@Injectable()
export class CallsService {

  private twilioAccountSid: string;
  private twilioAuthToken: string;
  private twilioAppSid: string;
  private twilioApiSecret: string;
  private androidPushSid: string;
  private iosPushSid: string;
  private twilioApiKey:string;
  private twilioClient:Twilio.Twilio;
  private twilioClientCall:Twilio.Twilio;
  private VoiceGrant = jwt.AccessToken.VoiceGrant;
  private VoiceResponse = Twilio.twiml.VoiceResponse;
  private twimlResponse: any;

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
    this.twilioAppSid = process.env.TWILIO_APP_SID;
    this.androidPushSid = process.env.ANDROID_PUSH_SID;
    this.iosPushSid = process.env.IOS_PUSH_SID;
    this.twilioApiKey = process.env.TWILIO_API_KEY;
    this.twimlResponse = new this.VoiceResponse();
    this.twilioClient = Twilio(this.twilioApiKey, this.twilioApiSecret, {
      accountSid: this.twilioAccountSid,
    });
    this.twilioClient.logLevel = 'debug'; 
    this.twilioClientCall = Twilio(this.twilioAccountSid, this.twilioAuthToken);
    this.twilioClientCall.logLevel = 'debug'; 
  }

  async requestCallingVoiceToken(
    _id: string,
    roleId: any,
    language: string,
    os: string,
    currency: string,
    unlimitedAccess: boolean,
    userReferralCode: any,
    stripeInfo: any,
    referralFreeMinutes: any,
  ) {
    try {
      this.logger.log(
        `/calls/token/=====> requestCallingVoiceToken : ${_id}, ${language},${os}, ${currency} ${unlimitedAccess}`,
      );

      this.logger.log(`/calls/token/=====> roleId : ${roleId}`);

      this.logger.log(
        `/calls/token/=====> userReferralCode : ${userReferralCode}`,
      );

      this.logger.log(`/calls/token/=====> stripeInfo : ${stripeInfo}`);
      this.logger.log(`/calls/token/=====> referralFreeMinutes : ${referralFreeMinutes}`);


      const identity = _id.toString();
      let pushCredentialPlatformSid: string;
      let dues = 0;

      let displayMessage = false;
      let isCardStatus = false;
      let isVerifiedStatus = false;
      let displayMessageFreeNmin = false;
      let remainingFreeMinutes = 0;

      // User Role Specific conditions. - Giving Unlimited Access.
      let freeUsersRoles = [
        'enterprise_company_staff',
        'enterprise_company_foreigner',
        'free_client',
      ];
      let isUnlimitedCallAccess =
        freeUsersRoles.includes(roleId.slug) || unlimitedAccess === true
          ? true
          : false;

      // Stripe Verified Cards Conditions.
      if (stripeInfo && stripeInfo.cardData && stripeInfo.cardData.length > 0) {
        for (var i = 0; i < stripeInfo.cardData.length; i++) {
          if (
            stripeInfo.cardData[i].isDefault == true &&
            stripeInfo.cardData[i].isVerified == 'APPROVED'
          ) {
            displayMessage = false;
            isVerifiedStatus = true;
            isCardStatus = true;
          }
          if (
            stripeInfo.cardData[i].cardType == 'OLD' &&
            stripeInfo.cardData[i].isDefault == true
          ) {
            displayMessage = false;
            isVerifiedStatus = true;
            isCardStatus = true;
          }
        }
      }

      if (isUnlimitedCallAccess) {
        displayMessage = false;
        isVerifiedStatus = true;
        dues = 0;
      }

      const isReferralUserAccess =
        roleId &&
        roleId.slug == 'referral_user' &&
        userReferralCode &&
        userReferralCode.isCreditCardShown === false
          ? true
          : false;

      if (isReferralUserAccess) {
        displayMessage = false;
        isVerifiedStatus = true;
        dues = 0;
      }

      const isReferralUserWithFreeMinAccess =
        await this.utilService.getUsersFreeMinutesUserType(referralFreeMinutes);

      const referralUserFreeReferralMinutes =
        await this.utilService.getUsersFreeMinutes(referralFreeMinutes);

      if (isReferralUserWithFreeMinAccess) {
        displayMessageFreeNmin = true;
        displayMessage = false;
        if (referralUserFreeReferralMinutes > 0) {
          remainingFreeMinutes =
            referralUserFreeReferralMinutes > 0
              ? referralUserFreeReferralMinutes
              : 0;
          isVerifiedStatus = true;
          dues = 0;
        }
      }
      if (os == constant.ANDROID) {
        pushCredentialPlatformSid = this.androidPushSid;
      } else if (os == constant.IOS) {
        pushCredentialPlatformSid = this.iosPushSid;
      }

      const voiceGrant = new this.VoiceGrant({
        outgoingApplicationSid: this.twilioAppSid,
        pushCredentialSid: pushCredentialPlatformSid,
      });

      const token = new jwt.AccessToken(
        this.twilioAccountSid,
        this.twilioApiKey,
        this.twilioApiSecret,
        {identity: identity}
      );
      token.addGrant(voiceGrant);

      this.logger.log(
        `/calls/token/=====> requestCallingVoiceToken ==== token :`, token
      );

      return {
        success: true,
        info: {
          identity: identity,
          token: token.toJwt(),
          credits: 0,
          displayMessage: displayMessage,
          displayMessageFreeNmin: displayMessageFreeNmin,
          isCardStatus: isCardStatus,
          remainingFreeMinutes: remainingFreeMinutes,
          lastPaymentDue: dues == 0 ? false : true,
          isVerifiedStatus: isVerifiedStatus,
          reply:
            dues == 0
              ? ''
              : this.i18n.t('lang.LAST_PAYMENT_DUE', { lang: language }),
        },
        message: this.i18n.t('lang.TOKEN_SUCCESS', { lang: language }),
      };
    } catch (error) {
      this.logger.error(
        `/calls/token/=====> requestCallingVoiceToken S ===> error : `,
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

  async voiceCallWebhookResponse(voiceCallData:any,language:string){
    try {
      this.logger.log(
        `/calls/voice/=====> request Body : `,voiceCallData
      );
      

      // const callResponse = await this.twilioClientCall.calls.create({
      //   from: "+18668675310",
      //   method: "POST",
      //   statusCallback: "http://44.227.114.189:4000/calls/voice-response",
      //   statusCallbackEvent: ["initiated", "ringing", "completed", "answered"],
      //   statusCallbackMethod: "POST",
      //   to: "+14155551212",
      //   url: " http://44.227.114.189:4000/calls/voice",
      // });

      this.logger.log(
        `/calls/voice/=====> request Body : `,voiceCallData
      );

      // this.twimlResponse.say(
      //   {
      //     voice: "alice",
      //   },
      //   "Calling Webhook is successfully retrieved the Request call body !!!"
      // );

      return this.twimlResponse.toString();

    } catch (error) {
      this.logger.error(
        `/calls/token/=====> voice S ===> error : `,
        error,
      );
      this.twimlResponse.say(
        {
          voice: "alice",
        },
        "Something went wrong with the call. Please try again in sometime."
      );
      return this.twimlResponse.toString();

    }
  }

  async voiceCallWebhookInvalidResponse(){
      this.twimlResponse.say(
        {
          voice: "alice",
        },
        "Something went wrong with the call. Please try again in sometime."
      );
      return this.twimlResponse.toString();

  }
}
