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
      const { _id, roleId, appLanguage } = req['userData'];
      this.logger.log(
        `/interpreter/findInterpreterList/=====> Login Data :  `,
        req['userdata'],
      );
      this.logger.log(
        `/interpreter/findInterpreterList/=====> Request Query : `,
        allQueryParams,
      );
      this.logger.log(
        `/interpreter/findInterpreterList/=====> Request Body : `,
        interpreterData,
      );

      //const data = await this.interpreterService.editInterpreterRate(_id,language,editInterpretationRatesData);

      const data = {
        filteredRequest: interpreterData,
        sortRequest: allQueryParams.sortingBy,
        paginationRequest: {
          currentPage: allQueryParams.page || 1,
          maxLimit: 20,
        },
        displayedRecords: 100,
        filteredRecords: [
          {
            fullName: 'Makoto',
            _id: '66289a7de7e43d3a52c16e4e',
            gender: 'male',
            photo: '',
            isOnline: true,
            isLogin: true,
            countryId: {
              _id: '59ca2eb54c5b0874203b766a',
              name: 'Spain',
            },
            cityId: {
              _id: '59c8ba74c0d97628bf7fec68',
              name: 'Albacete',
            },
            responseRate: 70,
            averageRating: 4,
            totalRating: 2,
            languages: [
              {
                _id: '59a3c559891d70748ead0e74',
                name: 'Spanish',
                type: 'native',
              },
              {
                _id: '59a3c559891d70748ead0e75',
                name: 'English',
                type: 'native',
              },
            ],
            interperterRates: [
              {
                fee: 0.8,
                currency: 'USD',
                languages: [
                  {
                    _id: '59a3c559891d70748ead0e74',
                    name: 'Spanish',
                  },
                  {
                    _id: '59a3c559891d70748ead0e75',
                    name: 'English',
                  },
                ],
              },
            ],
            expertise: [
              {
                _id: '59ca2eb54c5b0874203b766a',
                name: 'Economy',
              },
              {
                _id: '59ca2eb54c5b0874203b766a',
                name: 'Arts',
              },
            ],
          },
          {
            fullName: 'Tamayo',
            _id: '59c8ba74c0d97628bf7fec68',
            gender: 'male',
            photo: 'users/1721821829-JfXGCVETu3.jpeg',
            isOnline: true,
            isLogin: true,
            countryId: {
              _id: '59ca2eb54c5b0874203b766e',
              name: 'Iran',
            },
            cityId: {
              _id: '59c8ba74c0d97628bf7fec2b',
              name: 'Abadan',
            },
            responseRate: 70,
            averageRating: 4,
            totalRating: 2,
            languages: [
              {
                _id: '59a3c559891d70748ead0e74',
                name: 'Spanish',
                type: 'native',
              },
              {
                _id: '59a3c559891d70748ead0e75',
                name: 'English',
                type: 'native',
              },
            ],
            interperterRates: [
              {
                fee: 0.8,
                currency: 'USD',
                languages: [
                  {
                    _id: '59a3c559891d70748ead0e74',
                    name: 'Spanish',
                  },
                  {
                    _id: '59a3c559891d70748ead0e75',
                    name: 'English',
                  },
                ],
              },
            ],
            expertise: [
              {
                _id: '59ca2eb54c5b0874203b766a',
                name: 'Economy',
              },
              {
                _id: '59ca2eb54c5b0874203b766a',
                name: 'Arts',
              },
            ],
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
      const { _id, roleId, appLanguage } = req['userData'];
      this.logger.log(
        `/interpreter/uploadProfessionalDocsData/=====> Login Data :  `,
        req['userdata'],
      );
      this.logger.log(
        `/interpreter/uploadProfessionalDocsData/=====> Request Query : `,
        uploadProfessionalDocsData,
      );

      const data = {};

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
  @Get('/profileDetail')
  async interpreterGetProfile(
    @Param() interpreterProfileData: interpreterProfileDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/interpreter/profileDetail/=====>`);
      const { _id, roleId, appLanguage } = req['userData'];
      this.logger.log(
        `/interpreter/profileDetail/=====> Login Data :  `,
        req['userdata'],
      );
      this.logger.log(
        `/interpreter/profileDetail/=====> Request Query : `,
        interpreterProfileData,
      );

      const data = {
        interpreterProfileData: {
          fullName: 'Ninon Mufferuet',
          _id: '66289a7de7e43d3a52c16e4e',
          roleId: '59a3c559891d70748ead0e74',
          gender: 'female',
          photo: '',
          isOnline: true,
          responseRate: 70,
          averageRating: 4,
          totalRating: 2,
          languages: [
            {
              _id: '59a3c559891d70748ead0e74',
              name: 'Spanish',
              type: 'native',
            },
            {
              _id: '59a3c559891d70748ead0e75',
              name: 'English',
              type: 'native',
            },
          ],
          interperterRates: [
            {
              fee: 0.8,
              currency: 'USD',
              languages: [
                {
                  _id: '59a3c559891d70748ead0e74',
                  name: 'Spanish',
                },
                {
                  _id: '59a3c559891d70748ead0e75',
                  name: 'English',
                },
              ],
            },
          ],
          expertise: [
            {
              _id: '59ca2eb54c5b0874203b766a',
              name: 'Economy',
            },
            {
              _id: '59ca2eb54c5b0874203b766a',
              name: 'Arts',
            },
          ],
          review: [
            {
              _id: '59ca2eb54c5b0874203b766a',
              name: 'Test 1',
              photo: '',
              rating: '5',
              reviewComment: 'Great Service',
            },
            {
              _id: '59ca2eb54c5b0874203b766a',
              name: 'Test 2',
              photo: '',
              rating: '1',
              reviewComment: 'Pathetic!',
            },
          ],
          profileDetails: 'Hello Profile',
          academicBackground: ['IT', 'Computer'],
          qualification: ['Engineering', 'B.tech'],
          countryId: {
            _id: '59ca2eb54c5b0874203b766a',
            name: 'Spain',
          },
          cityId: {
            _id: '59c8ba74c0d97628bf7fec68',
            name: 'Albacete',
          },
        },
      };

      if (data && data != null) {
        this.responseService.sendSuccessResponse(
          res,
          data,
          'Record fetch success !!',
        );
      } else {
        this.logger.warn(`/interpreter/profileDetail=====> No record found ! `);
        this.responseService.sendForbidden(res);
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
      const { _id, roleId, appLanguage } = req['userData'];
      this.logger.log(
        `/interpreter/editProfile/=====> Login Data :  `,
        req['userdata'],
      );
      this.logger.log(
        `/interpreter/editProfile/=====> Request Body : `,
        interpreterEditProfileData,
      );

      const data = {};

      if (data && data != null) {
        this.responseService.sendSuccessResponse(
          res,
          data,
          'Record fetch success !!',
        );
      } else {
        this.logger.warn(`/interpreter/editProfile=====> No record found ! `);
        this.responseService.sendForbidden(res);
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
      const { _id, roleId, appLanguage } = req['userData'];
      this.logger.log(
        `/interpreter/editInterpretationRates/=====> Login Data :  `,
        req['userdata'],
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
      const { _id, appLanguage } = req['userData'];
      this.logger.log(
        `/interpreter/updateOnlineStatus/=====> Login Data :  `,
        req['userdata'],
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
  @ApiParam({
    name: 'interpreterId',
    type: String,
    example: '66289a7de7e43d3a52c16e4e',
  })
  @Get('/getAllReviews')
  async getAllReviews(
    @Param() interpreterProfileReviewData: interpreterProfileReviewDataDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<void> {
    try {
      this.logger.log(`/interpreter/getAllReviews/=====>`);
      const { _id, roleId, appLanguage } = req['userData'];
      this.logger.log(
        `/interpreter/getAllReviews/=====> Login Data :  `,
        req['userdata'],
      );
      this.logger.log(
        `/interpreter/getAllReviews/=====> Request Query : `,
        interpreterProfileReviewData,
      );

      const data = {
        interpreterReviewsData: [
          {
            fullName: 'Ninon Mufferuet',
            _id: '66289a7de7e43d3a52c16e4e',
            roleId: '59a3c559891d70748ead0e74',
            review: [
              {
                _id: '59ca2eb54c5b0874203b766a',
                name: 'Test 1',
                photo: '',
                rating: '5',
                reviewComment: 'Great Service',
              },
              {
                _id: '59ca2eb54c5b0874203b766a',
                name: 'Test 2',
                photo: '',
                rating: '1',
                reviewComment: 'Pathetic!',
              },
            ],
            reviewCount: 10,
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
