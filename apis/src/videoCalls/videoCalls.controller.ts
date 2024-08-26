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

import { VideoCallsService } from './videoCalls.service';
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
import { VideoCallsTokenDataDto } from './videoCalls.dto';

@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Video Calls')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('videoCalls')
export class VideoCallsController {
  constructor(
    private readonly videoCallsService: VideoCallsService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
    private readonly logger: MyLogger,
  ) {}

  @ApiOperation({
    summary: 'Calling Token Service Register.',
  })
  @Post('/token')
  async token(
    @Body() videoCallsTokenData: VideoCallsTokenDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/videoCalls/token/=====>`);
      const { _id, roleId, appLanguage, os, currency } = req['userData'];
      this.logger.log(
        `/videoCalls/token/=====> Login Data :  `,
        req['userdata'],
      );

      this.logger.log(
        `/videoCalls/token/=====> Request Body  : `,
        videoCallsTokenData,
      );

      const videoTokenData = await this.videoCallsService.requestCallingVideoToken(
        _id, roleId, appLanguage, os, currency
      );

      this.logger.log(
        `/videoCalls/token/=====> videoTokenData : `,
        videoTokenData,
      );

      if (
        videoTokenData &&
        videoTokenData.success === true &&
        videoTokenData.info
      ) {
        this.responseService.sendSuccessResponse(
          res,
          videoTokenData.info,
          videoTokenData.message,
        );
      } else {
        this.logger.warn(`/videoCalls/token=====> No record found ! `);
        this.responseService.sendBadRequest(
          res,
          {},
          this.i18n.t('lang.NO_RECORD_FOUND', { lang: appLanguage }),
        );
      }
    } catch (error) {
      this.logger.error(`/videoCalls/token=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }
}
