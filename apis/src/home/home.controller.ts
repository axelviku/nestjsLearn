import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  UsePipes,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CustomHeaders } from 'common/decorators/customHeaders.decorator';
import { GlobalI18nValidationPipe } from '../../../common/global-validation.pipe';
import { AuthGuard } from 'common/guards/auth-guard';

import { HomeService } from './home.service';
import { ResponseService } from 'common/services/response.service';
import { I18nService } from 'nestjs-i18n';
import { MyLogger } from '../my-logger.service';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { requestUserListAndAboutOyraaDataDto } from './home.dto';
import { constant } from 'common/constant/constant';

@ApiTags('Home')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('home')
export class HomeController {
  constructor(
    private readonly homeService: HomeService,
    private readonly responseService: ResponseService,
    private readonly logger: MyLogger,
    private readonly i18n: I18nService,
  ) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Fetch Interpreter Data',
  })
  @Post('/getUserListAndAboutOyraaData/')
  @ApiQuery({
    name: 'page',
    example: 1,
    required: true,
    type: String,
    description: 'Page number for pagination',
  })
  async fetchUserListAndAboutOyraaData(
    @Query() allQueryParams: { page?: string },
    @Body() requestUserData: requestUserListAndAboutOyraaDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(
        `/home/getUserListAndAboutOyraaData/=====>`,
        allQueryParams,
      );
      const { _id, appLanguage, recentUser,personalInfo } = req['userData'];
      this.logger.log(
        `/auth/getUserListAndAboutOyraaData/=====> Request body : `,
        requestUserData,
      );
      const aboutOyraaData =
        await this.homeService.getUserListAndAboutOyraaData(appLanguage);
      if (
        (requestUserData && requestUserData.type == constant.CLIENT) ||
        requestUserData.type == constant.REFERRAL_USER
      ) {
        const recUserData = await this.homeService.getRecentUser(
          appLanguage,
          recentUser,
          allQueryParams,
          personalInfo
        );
        const data = {
          recentUser:
            recUserData && recUserData.info && recUserData.info.recentUserData
              ? recUserData.info
              : {
                  recentUserData: [],
                  // maxLimit: 10,
                  // currentPage: parseInt(allQueryParams.page),
                  // displayedRecord: 0
                },

          aboutOyraa: aboutOyraaData.info,
        };
        this.responseService.sendSuccessResponse(
          res,
          data,
          this.i18n.t('lang.RECORD_FETCH_SUCCESFULLY', { lang: appLanguage }),
        );
      } else if (
        requestUserData &&
        requestUserData.type == constant.INTERPRETER
      ) {
        const intUserData: any = await this.homeService.interpreterData(
          appLanguage,
          _id,
        );
        const data = {
          userProfileData: intUserData.info.userData,
          jobListing: {
            jobListingData: intUserData.info?.jobListing?.jobListing,
            loadMore: false,
          },
          cashOut: {
            cashOutData: intUserData.info.cashoutHistory.cashoutData,
            loadMore: false,
          },
          aboutOyraa: aboutOyraaData.info,
        };
        this.responseService.sendSuccessResponse(
          res,
          data,
          this.i18n.t('lang.RECORD_FETCH_SUCCESFULLY', { lang: appLanguage }),
        );
      }
    } catch (error) {
      this.logger.error(
        `/home/getUserListAndAboutOyraaData=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }
}
