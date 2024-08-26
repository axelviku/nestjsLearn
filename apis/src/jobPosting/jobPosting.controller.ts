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

import { JobPostingService } from './jobPosting.service';
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
import { CreateJobPostingDataDto } from './jobPosting.dto';
@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Job Posting')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('jobPosting')
export class JobPostingController {
  constructor(
    private readonly jobPostingService: JobPostingService,
    private readonly responseService: ResponseService,
    private readonly logger: MyLogger,
  ) {}

  @ApiOperation({
    summary: 'Create New Job and post it for all interpreters.',
  })
  @Post('/createJob')
  async createJob(
    @Body() createJobPostingData: CreateJobPostingDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/jobPosting/createJob/=====>`);
      const { _id, roleId, appLanguage } = req['userData'];
      this.logger.log(
        `/jobPosting/createJob/=====> Login Data :  `,
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
        this.logger.warn(`/jobPosting/createJob=====> No record found ! `);
        this.responseService.sendForbidden(res);
      }
    } catch (error) {
      this.logger.error(`/jobPosting/createJob=====> Catch C Error : `, error);
      this.responseService.sendForbidden(res);
    }
  }
}
