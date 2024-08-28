import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Req,
  UsePipes,
  Next,
  UseGuards,
  Param,
  All,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomHeaders } from 'common/decorators/customHeaders.decorator';
import { GlobalI18nValidationPipe } from '../../../common/global-validation.pipe';
import { AuthGuard } from 'common/guards/auth-guard';

import { CallsService } from './calls.service';
import { AppService } from '../app.service';
import { ResponseService } from 'common/services/response.service';
import { I18nService, I18nLang } from 'nestjs-i18n';
import { MyLogger } from '../my-logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CallsTokenDataDto, VoiceCallDataDto, VoiceResponseCallDataDto } from './calls.dto';
import { TwilioService } from 'common/utils/twilio.service';

import * as Twilio from 'twilio';
import { jwt } from 'twilio';

@ApiTags('Calls')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('calls')
export class CallsController {

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
    private readonly callsService: CallsService,
    private readonly responseService: ResponseService,
    private readonly twilioService : TwilioService,
    private readonly i18n: I18nService,
    private readonly logger: MyLogger,
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
    // this.twilioClient.logLevel = 'debug'; 
    this.twilioClientCall = Twilio(this.twilioAccountSid, this.twilioAuthToken);
    // this.twilioClientCall.logLevel = 'debug'; 

  }


  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Calling Token Service Register.',
  })
  @Get('/token')
  async token(
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/calls/token/=====>`);
      const { _id, roleId, appLanguage, os, currency, unlimitedAccess, userReferralCode, stripeInfo, referralFreeMinutes } = req['userData'];
      this.logger.log(
        `/calls/token/=====> Login Data :  `,
        req['userdata'],
      );

      const voiceTokenData = await this.callsService.requestCallingVoiceToken(
        _id, roleId, appLanguage, os, currency, unlimitedAccess, userReferralCode, stripeInfo, referralFreeMinutes
      );

      // this.logger.log(
      //   `/auth/requestOtp/=====> voiceTokenData : `,
      //   voiceTokenData,
      // );

      if (
        voiceTokenData &&
        voiceTokenData.success === true &&
        voiceTokenData.info
      ) {
        this.responseService.sendSuccessResponse(
          res,
          voiceTokenData.info,
          voiceTokenData.message,
        );
      } else {
        this.logger.warn(`/calls/token=====> No record found ! `);
        this.responseService.sendBadRequest(
          res,
          {},
          this.i18n.t('lang.NO_RECORD_FOUND', { lang: appLanguage }),
        );
      }
    } catch (error) {
      this.logger.error(`/calls/token=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Calling Token Service Register.',
  })
  @Post('/voice')
  async voice(
    @Body()
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/calls/voice/=====>`);
      this.logger.log(`/calls/voice/=====> voiceCallData : `, req.body);

      const VoiceResponse = Twilio.twiml.VoiceResponse;
      const twiml = new VoiceResponse();
      // this.logger.log(`/calls/voice/=====> twimlRes : `, twimlRes);
      // const twimlData = this.callsService.voiceCallWebhookResponse(req.body);
      // this.logger.log(`/calls/voice/=====> twimlData : `, twimlData);
      // const twiml = `<Response><Say>Hello, Thank you for calling! Please wait while we connect you. your call has been received.</Say></Response>`;
      // const twiml = new this.VoiceResponse();
      twiml.say(
        {
          voice: "alice",
        },
        `Hello, Thank you for calling! Please wait while we connect you. your call has been received.`
      );
      // res.setHeader('Content-Type', 'text/xml');
      res.type('text/xml');
      res.send(twiml.toString());

    } catch (error) {
      this.logger.error(`/calls/voice=====> Catch C Error : `, error);
      const VoiceResponse = Twilio.twiml.VoiceResponse;
      const twiml = new VoiceResponse();

      twiml.say(
        {
          voice: "alice",
        },
        `Something went wrong with the call. Please try again in sometime.`
      );
      // res.setHeader('Content-Type', 'text/xml');
      res.type('text/xml');
      res.send(twiml.toString());
      // const twiml = new this.VoiceResponse();
      // twiml.say(
      //   {
      //     voice: "alice",
      //   },
      //   "Something went wrong with the call. Please try again in sometime."
      // );
      // res.setHeader('Content-Type', 'text/xml');
      // const twiml = `<Response><Say>Hello, Something went wrong with the call. Please try again in sometime.</Say></Response>`;
      // res.set('Content-Type', 'text/xml');
      // res.send(twiml);
    }
  }

  @ApiOperation({
    summary: 'Voice Response For Calls',
  })
  @Post('/voiceResponse')
  async voiceResponse(
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/calls/voiceResponse/=====>`);

      this.logger.log(
        `/calls/voiceResponse/=====> voiceResponseCallData :  `,
        req.body
      );
   
      const twiml = this.callsService.twimlVoiceResponse();
      res.setHeader('Content-Type', 'text/xml');
      res.send(twiml);

    } catch (error) {
      this.logger.error(`/calls/voiceResponse=====> Catch C Error : `, error);
      const twiml = new this.VoiceResponse();
      twiml.say(
        {
          voice: "alice",
        },
        "Something went wrong with the call. Please try again in sometime."
      );
      res.setHeader('Content-Type', 'text/xml');
      res.send(twiml);
    }
  }
}
