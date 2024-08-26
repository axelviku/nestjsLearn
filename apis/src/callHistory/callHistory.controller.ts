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

import { CallHistoryService } from './callHistory.service';
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
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Call History')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('callHistory')
export class CallHistoryController {
  constructor(
    private readonly callHistoryService: CallHistoryService,
    private readonly responseService: ResponseService,
    private readonly logger: MyLogger,
  ) {}

  @ApiOperation({
    summary: 'Incoming Call Logs History.',
  })
  @Get('/incoming')
  async incomingCallLogs(
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/callHistory/incoming/=====>`);
      const { _id, roleId, appLanguage } = req['userData'];
      this.logger.log(
        `/callHistory/incoming/=====> Login Data :  `,
        req['userdata'],
      );

      const data = {};

      if (data && data != null) {
        this.responseService.sendSuccessResponse(
          res,
          {},
          'Records fetched successfully !!',
        );
      } else {
        this.logger.warn(`/callHistory/incoming=====> No record found ! `);
        this.responseService.sendForbidden(res);
      }
    } catch (error) {
      this.logger.error(`/callHistory/incoming=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Outgoing Call Logs History.',
  })
  @Get('/outgoing')
  async outgoingCallLogs(
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/callHistory/outgoing/=====>`);
      const { _id, roleId, appLanguage } = req['userData'];
      this.logger.log(
        `/callHistory/outgoing/=====> Login Data :  `,
        req['userdata'],
      );

      const data = {};

      if (data && data != null) {
        this.responseService.sendSuccessResponse(
          res,
          {},
          'Records fetched successfully !!',
        );
      } else {
        this.logger.warn(`/callHistory/outgoing=====> No record found ! `);
        this.responseService.sendForbidden(res);
      }
    } catch (error) {
      this.logger.error(`/callHistory/outgoing=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }
}
