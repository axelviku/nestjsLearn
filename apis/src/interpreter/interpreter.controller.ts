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

import { InterpreterService } from './interpreter.service';
import { ResponseService } from 'common/services/response.service';
import { I18nService, I18nLang } from 'nestjs-i18n';
import { MyLogger } from '../my-logger.service';
import { AppService } from '../app.service';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import {
  interpreterDataDto,
  interpreterProfileDataDto,
  interpreterEditProfileDataDto,
  updateOnlineStatusDataDto,
  interpreterProfileReviewDataDto,
  editInterpretationRatesDataDto,
  uploadProfessionalDocsDataDto,
} from './interpreter.dto';
import { constant } from 'common/constant/constant';
import { INTERPRETER_FILTER } from 'common/enums';

@UseGuards(AuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Interpreter')
@CustomHeaders()
@UsePipes(GlobalI18nValidationPipe)
@Controller('interpreter')
export class InterpreterController {
  constructor(
    private readonly appService: AppService,
    private readonly interpreterService: InterpreterService,
    private readonly responseService: ResponseService,
    private readonly logger: MyLogger,
  ) {}

  @ApiOperation({
    summary:
      'Find Interpreter Users listing with searching , sorting and pagination.',
  })
  @ApiQuery({
    name: 'sortingBy',
    enum: INTERPRETER_FILTER,
    enumName: 'PRICE_DSC',
  })
  @ApiQuery({ name: 'page', type: String, example: '1' })
  @Post('/findInterpreterList')
  async findInterpreterListWithSearch(
    @Body() interpreterData: interpreterDataDto,
    @Query() allQueryParams: { sortingBy?: INTERPRETER_FILTER; page?: string },
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/interpreter/findInterpreterList/=====>`);
      const {  _id, roleId, fullName, appLanguage, userReferralCode,personalInfo } = req['userData'];
      const language: string = await this.appService.getLanguage(req.headers);

      this.logger.log(
        `/interpreter/findInterpreterList/=====> Login Data :  ${_id}, ${fullName}, ${roleId}`
      );
      this.logger.log(
        `/interpreter/findInterpreterList/=====> Request Query : `,
        allQueryParams,
      );
      this.logger.log(
        `/interpreter/findInterpreterList/=====> Request Body : `,
        interpreterData,
      );

      const data = await this.interpreterService.findInterpreterListWithSearch(
        interpreterData,
        language,
        userReferralCode,
        personalInfo,
        allQueryParams,
      );

      if (data && data != null) {
        this.responseService.sendSuccessResponse(
          res,
          data.info,
          'Record fetch success !!',
        );
      } else {
        this.logger.warn(
          `/interpreter/findInterpreterList=====> No record found ! `,
        );
        this.responseService.sendForbidden(res);
      }
    } catch (error) {
      this.logger.error(
        `/interpreter/findInterpreterList=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Interpreter Professional Document get,upload and remove data.',
  })
  @Post('/uploadProfessionalDocsData')
  async uploadProfessionalDocsData(
    @Body() uploadProfessionalDocsData: uploadProfessionalDocsDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/interpreter/uploadProfessionalDocsData/=====>`);
      const {  _id, roleId, fullName, appLanguage, interpreterInfo } = req['userData'];
      const { type, removeDocumentIds, addDocumentData } =
        uploadProfessionalDocsData;
      this.logger.log(
        `/interpreter/uploadProfessionalDocsData/=====> Login Data : ${_id}, ${fullName}, ${roleId}`
      );
      this.logger.log(
        `/interpreter/uploadProfessionalDocsData/=====> Request Query : `,
        uploadProfessionalDocsData,
      );

      let data = {};

      if (type == 'get') {
        data = interpreterInfo.professional;
      }
      if (type == 'add' && addDocumentData!==undefined) {
        data = await this.interpreterService.saveDocuments(
          _id,
          addDocumentData,
        );
      }
      if (type == 'remove' && removeDocumentIds!==undefined) {
        if (interpreterInfo.professional.docs.length <= 1) {
          data = await this.interpreterService.deleteDocuments(
            _id,
            removeDocumentIds,
            false,
          );
        } else {
          data = await this.interpreterService.deleteDocuments(
            _id,
            removeDocumentIds,
            true,
          );
        }
      }

      if (data && data != null) {
        this.responseService.sendSuccessResponse(
          res,
          data,
          'Record fetch success !!',
        );
      } else {
        this.logger.warn(
          `/interpreter/uploadProfessionalDocsData=====> No record found ! `,
        );
        this.responseService.sendForbidden(res);
      }
    } catch (error) {
      this.logger.error(
        `/interpreter/uploadProfessionalDocsData=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Get Interpreter User Profile Detail.',
  })
  @ApiParam({
    name: 'interpreterId',
    type: String,
    example: '66289a7de7e43d3a52c16e4e',
  })
  @Get('/profileDetail/:interpreterId')
  async interpreterGetProfile(
    @Param() interpreterProfileData: interpreterProfileDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/interpreter/profileDetail/=====>`);
      const {  _id, roleId, fullName, appLanguage, favUsers,personalInfo,userReferralCode } = req['userData'];
      this.logger.log(
        `/interpreter/profileDetail/=====> Login Data :  ${_id}, ${fullName}, ${roleId}`
      );
      this.logger.log(
        `/interpreter/profileDetail/=====> Request Query : `,
        interpreterProfileData,
      );
      const data = await this.interpreterService.getInterpreterProfile(
        appLanguage,
        interpreterProfileData,
        favUsers,
        personalInfo,
        userReferralCode
      );

      if (data && data != null) {
        this.responseService.sendSuccessResponse(res, data.info, data.message);
      } else {
        this.logger.warn(`/interpreter/profileDetail=====> No record found ! `);
        this.responseService.sendBadRequest(res, {}, data.message);
      }
    } catch (error) {
      this.logger.error(
        `/interpreter/profileDetail=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Edit Interpreter User Profile.',
  })
  @Post('/editProfile')
  async interpreterEditProfile(
    @Body() interpreterEditProfileData: interpreterEditProfileDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/interpreter/editProfile/=====>`);
      const { _id, roleId, fullName, appLanguage } = req['userData'];
      this.logger.log(
        `/interpreter/editProfile/=====> Login Data :  ${_id}, ${fullName}, ${roleId}`
      );
      this.logger.log(
        `/interpreter/editProfile/=====> Request Body : `,
        interpreterEditProfileData,
      );

      const data = await this.interpreterService.updateInterpreterProfile(
        appLanguage,
        interpreterEditProfileData,
      );

      if (data && data != null) {
        this.responseService.sendSuccessResponse(res, data.info, data.message);
      } else {
        this.logger.warn(`/interpreter/editProfile=====> No record found ! `);
        this.responseService.sendBadRequest(res, {}, data.message);
      }
    } catch (error) {
      this.logger.error(
        `/interpreter/editProfile=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Edit Interpretation Rates.',
  })
  @Post('/editInterpretationRates')
  async editInterpretationRates(
    @Body() editInterpretationRatesData: editInterpretationRatesDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      const language: string = await this.appService.getLanguage(req.headers);
      this.logger.log(`/interpreter/editInterpretationRates/=====>`);
      const {  _id, roleId, fullName, appLanguage } = req['userData'];
      this.logger.log(
        `/interpreter/editInterpretationRates/=====> Login Data :  ${_id}, ${fullName}, ${roleId}`
      );
      this.logger.log(
        `/interpreter/editInterpretationRates/=====> Request Body : `,
        editInterpretationRatesData,
      );

      const data = await this.interpreterService.editInterpreterRate(
        _id,
        language,
        editInterpretationRatesData,
      );

      if (data && data != null) {
        this.responseService.sendSuccessResponse(
          res,
          data,
          'Record fetch success !!',
        );
      } else {
        this.logger.warn(
          `/interpreter/editInterpretationRates=====> No record found ! `,
        );
        this.responseService.sendForbidden(res);
      }
    } catch (error) {
      this.logger.error(
        `/interpreter/editInterpretationRates=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Update Online Status for Interpreter user.',
  })
  @Post('/updateOnlineStatus')
  async updateOnlineStatus(
    @Body() updateOnlineStatusData: updateOnlineStatusDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/interpreter/updateOnlineStatus/=====>`);
      const { _id, roleId, fullName, appLanguage } = req['userData'];
      this.logger.log(
        `/interpreter/updateOnlineStatus/=====> Login Data :  ${_id}, ${fullName}, ${roleId}`
      );
      this.logger.log(
        `/interpreter/updateOnlineStatus/=====> Request Body : `,
        updateOnlineStatusData,
      );

      const data = await this.interpreterService.onlineOfflineInterPreter(
        _id,
        updateOnlineStatusData.status,
        appLanguage,
      );
      if (data && data != null) {
        this.responseService.sendSuccessResponse(res, data.info, data.message);
      } else {
        this.logger.warn(
          `/interpreter/updateOnlineStatus=====> No record found ! `,
        );
        this.responseService.sendBadRequest(res, {}, data.message);
      }
    } catch (error) {
      this.logger.error(
        `/interpreter/updateOnlineStatus=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }

  @ApiOperation({
    summary: 'Get Interpreter All Review and Ratings in Profile.',
  })
  @ApiQuery({
    name: 'interpreterId',
    type: String,
    example: '66289a7de7e43d3a52c16e4e',
  })
  @ApiQuery({ name: 'page', type: String, example: '1' })
  @Get('/getAllReviews')
  async getAllReviews(
    @Query() interpreterProfileReviewData: interpreterProfileReviewDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/interpreter/getAllReviews/=====>`);
      const { _id, fullName,roleId, appLanguage } = req['userData'];
      const { interpreterId, page } = interpreterProfileReviewData;

      this.logger.log(
        `/interpreter/getAllReviews/=====> Login Data :  ${_id}, ${fullName}, ${roleId}`
      );
      this.logger.log(
        `/interpreter/getAllReviews/=====> Request Query : `,
        interpreterProfileReviewData,
      );

      const limitRecord = parseInt(process.env.REVIEW_LIST_LIMIT);
      const data = await this.interpreterService.getAllReview(
        interpreterId,
        parseInt(page),
        limitRecord,
      );

      if (data && data != null) {
        this.responseService.sendSuccessResponse(
          res,
          data,
          'Record fetch success !!',
        );
      } else {
        this.logger.warn(`/interpreter/getAllReviews=====> No record found ! `);
        this.responseService.sendForbidden(res);
      }
    } catch (error) {
      this.logger.error(
        `/interpreter/getAllReviews=====> Catch C Error : `,
        error,
      );
      this.responseService.sendForbidden(res);
    }
  }
}
