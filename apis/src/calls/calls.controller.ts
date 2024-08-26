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
import { CallsTokenDataDto, VoiceCallDataDto } from './calls.dto';
import { TwilioService } from 'common/utils/twilio.service';

@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Calls')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('calls')
export class CallsController {
  constructor(
    private readonly callsService: CallsService,
    private readonly responseService: ResponseService,
    private readonly twilioService : TwilioService,
    private readonly i18n: I18nService,
    private readonly logger: MyLogger,
  ) {}

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

      this.logger.log(
        `/auth/requestOtp/=====> voiceTokenData : `,
        voiceTokenData,
      );

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
    @Body() voiceCallData: VoiceCallDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/calls/voice/=====>`);
      const { _id, roleId, appLanguage, os, currency, unlimitedAccess, userReferralCode, stripeInfo } = req['userData'];
      this.logger.log(
        `/calls/voice/=====> Login Data :  `,
        req['userdata'],
      );
      const twiml = this.callsService.voiceCallWebhookResponse(voiceCallData,appLanguage);
      res.set('Content-Type', 'text/xml');
      res.send(twiml);

    } catch (error) {
      this.logger.error(`/calls/voice=====> Catch C Error : `, error);
      const twiml = this.callsService.voiceCallWebhookInvalidResponse();
      res.set('Content-Type', 'text/xml');
      res.send(twiml);
    }
  }
}
