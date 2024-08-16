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

import { NotificationService } from './notification.service';
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
@ApiTags('Notification')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly responseService: ResponseService,
    private readonly logger: MyLogger,
  ) {}

  @ApiOperation({
    summary: 'Notification List with Pagination.',
  })
  @ApiQuery({ name: 'page', type: String, example: '1' })
  @Get('/list')
  async listOfNotifications(
    @Query() allQueryParams: { page?: string },
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/notification/list/=====>`);
      const { _id, roleId, appLanguage } = req['userData'];
      this.logger.log(
        `/notification/list/=====> Login Data :  `,
        req['userdata'],
      );
      this.logger.log(
        `/notification/list/=====> Request Query : `,
        allQueryParams,
      );

      const data = {
        paginationRequest: {
          currentPage: allQueryParams.page || 1,
          maxLimit: 50,
        },
        displayedRecords: 100,
        filteredRecords: [
          {
            fullName: 'Makoto',
            _id: '66289a7de7e43d3a52c16e4e',
            photo: '',
            type: 'user',
            isOnline: true,
            created: '24-07-2024:10:00UTC',
            message:
              'Natalie Lewis applied to the Job Posting 社外取引先とのオンライン会議にオンラインで参加いただきたいです',
          },
          {
            fullName: 'Tamayo',
            _id: '66289a7de7e43d3a52c16e4e',
            photo: '',
            type: 'user',
            isOnline: true,
            created: '24-07-2024:10:00UTC',
            message:
              'Natalie Lewis applied to the Job Posting 社外取引先とのオンライン会議にオンラインで参加いただきたいです',
          },
          {
            fullName: 'Oyraa User',
            _id: '66289a7de7e43d3a52c16e4e',
            photo: '',
            isOnline: true,
            type: 'admin',
            created: '24-07-2024:10:00UTC',
            message: 'Billing for October 2023 has been finalized.',
          },
          {
            fullName: 'Ninon',
            _id: '66289a7de7e43d3a52c16e4e',
            photo: '',
            type: 'user',
            isOnline: true,
            created: '24-07-2024:10:00UTC',
            message:
              'Natalie Lewis applied to the Job Posting 社外取引先とのオンライン会議にオンラインで参加いただきたいです',
          },
          {
            fullName: 'Tom',
            _id: '66289a7de7e43d3a52c16e4e',
            photo: '',
            type: 'user',
            isOnline: true,
            created: '24-07-2024:10:00UTC',
            message:
              'Natalie Lewis applied to the Job Posting 社外取引先とのオンライン会議にオンラインで参加いただきたいです',
          },
        ],
      };

      if (data && data != null) {
        this.responseService.sendSuccessResponse(
          res,
          data,
          'Record fetch success !!',
        );
      } else {
        this.logger.warn(`/notification/list=====> No record found ! `);
        this.responseService.sendForbidden(res);
      }
    } catch (error) {
      this.logger.error(`/notification/list=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }
}
